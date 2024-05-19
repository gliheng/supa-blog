import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { SupabaseClient } from "@supabase/supabase-js";
import { load } from "@std/dotenv";
import { nanoid } from "npm:nanoid";
import moment from "npm:moment";


await load({ export: true });

///////////////////////////////////////////////////////////////////////////////////
const project = Deno.env.get('project');
const anon = Deno.env.get('anon');
const email = Deno.env.get('email');
const password = Deno.env.get('password');
const ghostUrl = Deno.env.get('ghostUrl');
///////////////////////////////////////////////////////////////////////////////////

const file = Deno.args[0];

if (!file) {
  throw 'Input file required';
}

const imageReg1 = /__GHOST_URL__\/content\/images\/(\d+\/\d+\/[\w-]+\.\w+)/g;
const imageReg2 = /__GHOST_URL__\/content\/images\/size\/\w+\/(\d+\/\d+\/[\w-]+\.\w+)/g;

async function process(file: string) {
  const data = await Deno.readTextFile(file);

  const images = [
    ...data.matchAll(imageReg1),
    ...data.matchAll(imageReg2),
  ].map(g => g[1]);
  const imageSet = new Set(images);

  const supabase = createClient(`https://${project}.supabase.co`, anon);
  
  const { data: userData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error.message;
  }

  const imageMap = await uploadImages(supabase, imageSet);
  
  const newData = data.replaceAll(imageReg1, (match: string, p1: string) => {
    return imageMap[p1] ?? match;
  }).replaceAll(imageReg2, (match: string, p1: string) => {
    return imageMap[p1] ?? match;
  });

  const postData = JSON.parse(newData).db[0].data;

  const { posts, tags, posts_tags } = postData;

  const tagId2TagName: Record<string, string> = {}
  tags.forEach((e: Tag) => {
    tagId2TagName[e.id] = e.name;
  });

  const postId2TagList: Record<string, string[]> = {};
  posts_tags.forEach((e: Post2Tag) => {
    if (!postId2TagList[e.post_id]) {
      postId2TagList[e.post_id] = [];
    }
    const tagName = tagId2TagName[e.tag_id];
    if (tagName) {
      postId2TagList[e.post_id].push(tagName);
    }
  });

  for (const post of posts as Post[]) {
    const tags = postId2TagList[post.id];

    const newPost = {
      title: post.title,
      slug: post.slug,
      draft: false,
      image: post.feature_image,
      featured: !!post.featured,
      content: post.mobiledoc,
      format: 'mobiledoc',
      tags,
      updated_at: formatTime(post.updated_at),
      created_at: formatTime(post.created_at),
      html: post.html,
      excerpt: post.plaintext?.substring(0, 500),
    };
    console.log('Creating post', newPost);

    const { data, error } = await supabase.rpc('create_post', { rec: newPost });
    if (error) {
      throw error.message;
    }
  }
}

process(file);

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface Post2Tag {
  id: string;
  post_id: string;
  tag_id: string;
}

interface Post {
  id: string;
  html: string;
  title: string;
  slug: string;
  mobiledoc: string;
  plaintext: string;
  created_at: string;
  updated_at: string;
  featured: number;
  feature_image: string;
}

async function uploadImages(supa: SupabaseClient, imageSet: Set<string>): Promise<Record<string, string>> {
  const imageMap: Record<string, string> = {};
  const bucket = await supa.storage.from('uploads');
  for (const img of imageSet) {
    const id = nanoid();

    const url = `${ghostUrl}/content/images/${img}`;
    console.log('Uploading image: ', url);

    const res = await fetch(url);

    if (!res.body) throw 'Cannot read img: ' + img;
    const { data, error } = await bucket.upload(id, res.body);
    if (error) {
      throw error.message;
    }
    const { data: { publicUrl }} = bucket.getPublicUrl(data.path);
    imageMap[img] = publicUrl;
  }
  return imageMap;
}

function formatTime(t: string): string {
  return moment(t).toDate();
}
