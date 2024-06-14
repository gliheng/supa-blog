create extension if not exists hstore schema public;
create extension if not exists pgroonga schema public;

create table if not exists public.profile (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  avatar text,
  primary key (id)
);

-- inserts a row into public.profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profile (id, display_name, avatar)
  values (new.id, new.raw_user_meta_data ->> 'displayName', new.raw_user_meta_data ->> 'avatar')
  on conflict (id)
  do update set display_name=new.raw_user_meta_data ->> 'displayName', avatar=new.raw_user_meta_data ->> 'avatar';
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.post (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image VARCHAR(1024),
  format VARCHAR(16),
  content JSONB,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  draft BOOL DEFAULT true,
  featured BOOL DEFAULT false,
  excerpt TEXT DEFAULT '',
  html TEXT DEFAULT '',
  user_id uuid not null references public.profile(id) on delete cascade
);

create view tags as select distinct jsonb_array_elements(tags) as tags from post;


create or replace function create_post(rec public.post) 
returns public.post
language plpgsql
as $$
DECLARE
  initial_slug text;
  unique_slug text;
  counter integer := 1;
  inserted record;
BEGIN
  -- Generate slug
  initial_slug := rec.slug;
  unique_slug := rec.slug;
  -- Check if slug already exists in the table
  WHILE EXISTS (SELECT 1 FROM public.post WHERE slug=unique_slug) LOOP
    unique_slug := initial_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  rec.user_id := auth.uid();
  rec.slug = unique_slug;

  if rec.created_at is null then
    rec.created_at = now();
  end if;
  
  if rec.updated_at is null then
    rec.updated_at = now();
  end if;

  INSERT INTO public.post (
    title, slug, image, content, format,
    tags, created_at, updated_at, draft, featured,
    excerpt, html, user_id
  ) VALUES (
    rec.title, rec.slug, rec.image, rec.content, rec.format,
    rec.tags, rec.created_at, rec.updated_at, rec.draft, rec.featured,
    rec.excerpt, rec.html, rec.user_id
  ) RETURNING * INTO inserted;

  RETURN inserted;
END;
$$;


CREATE OR REPLACE FUNCTION update_post(id INT, rec public.post)
RETURNS SETOF public.post
LANGUAGE plpgsql
AS $$
DECLARE
  updated_row RECORD;
  store_obj hstore;
  update_query TEXT;
  column_name TEXT;
BEGIN
  if rec.updated_at is null then
    rec.updated_at = now();
  end if;

  -- Convert the input record to hstore
  store_obj := hstore(rec);

  -- Build the update query dynamically
  update_query := 'UPDATE public.post SET ';

  -- Iterate over the columns and construct the SET clause
  FOREACH column_name in ARRAY akeys(store_obj) LOOP
    IF store_obj -> column_name IS NOT NULL THEN
      update_query := update_query || format('%s=%s', column_name, quote_literal(store_obj -> column_name)) || ', ';
    END IF;
  END LOOP;

  -- Remove the trailing comma and space
  update_query := rtrim(update_query, ', ');

  -- Add the WHERE clause to the update query
  update_query := update_query || ' WHERE id = ' || id || ' RETURNING *;';

  -- Execute the update query
  EXECUTE update_query INTO updated_row;

  -- Return the updated row
  RETURN NEXT updated_row;
END;
$$;

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

GRANT EXECUTE ON FUNCTION create_post TO authenticated;
GRANT EXECUTE ON FUNCTION update_post TO authenticated;

-- post_content is for full text searching
create table if not exists public.post_content (
  id integer not null references public.post on delete cascade,
  content text,
  primary key (id)
);

create index ix_post_content ON public.post_content USING pgroonga(content);

-- inserts a row into public.post_content
create or replace function public.handle_new_post()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  concat_str text;
begin
  concat_str := new.title || ' ' || new.excerpt || ' ' || regexp_replace(new.html, E'<[^>]+>', ' ', 'gi');
  insert into public.post_content (id, content)
  values (new.id, concat_str)
  on conflict (id)
  do update set content=concat_str;
  return new;
end;
$$;

-- delete a row into public.post_content
create or replace function public.handle_delete_post()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public.post_content where id = old.id;
  return old;
end;
$$;

-- trigger the function every time a post is created
create trigger on_post_created
  after insert on public.post
  for each row execute procedure public.handle_new_post();

create trigger on_post_updated
  after update on public.post
  for each row execute procedure public.handle_new_post();

create trigger on_post_deleted
  after delete on public.post
  for each row execute procedure public.handle_delete_post();

create or replace function search_post(key text) 
returns setof public.post
language plpgsql
as $$
begin
  return query select * from public.post where id in (select id from public.post_content where content &@~ key);
end;
$$;
