import { defineStore } from 'pinia';

export interface Post {
  id: number;
  title: string;
}

export const postFields = 'id,slug,title,tags,excerpt,image,created_at,draft,featured,format';

export const usePostsStore = defineStore('posts', () => {
  const supa = useSupabase();
  const { blog } = useAppConfig();
  const opts = ref<{
    type?: string;
    tag?: string;
  }>();
  const postList = ref<Post[] | undefined>();
  const initd = ref(false);
  const pending = ref(false);
  const finished = ref(false);
  const error = ref();
  const count = ref(0);

  function init(_opts: {
    type?: string,
    tag?: string,
  }) {
    if (!postList.value || opts.value?.type != _opts.type || opts.value?.tag != _opts.tag) {
      initd.value = false;
      opts.value = _opts;
      pending.value = false;
      postList.value = undefined;
      finished.value = false;
      error.value = undefined;
      count.value = 0;
      return fetch();
    }
  }

  async function fetch(start = 0) {
    if (pending.value) return;

    const query = (count = false) => {
      let q = supa.from('post')
        .select(postFields + ',profile(avatar, display_name)', count ? {
          head: true,
          count: 'exact',
        } : undefined)
        .eq('featured', false);
      const { type, tag } = opts.value ?? {};
      if (type == 'draft') {
        q = q.eq('draft', true);
      } else if (type == 'published') {
        q = q.eq('draft', false);
      }
      if (tag) {
        q = q.filter('tags', 'cs', `["${tag}"]`);
      }
      return q;
    };

    pending.value = true;
    
    const { data, error: err } = await query()
      .order('created_at', {
        ascending: false,
      })
      .range(start, start + (blog.pageSize ?? 50) - 1);

    const { count: cnt } = await query(true);

    pending.value = false;
    initd.value = true;

    if (typeof cnt == 'number') {
      count.value = cnt;
    }
    if (data) {
      if (start == 0) {
        postList.value = data;
      } else {
        postList.value.splice(start, 0, ...data);
      }
      finished.value = postList.value.length >= count.value;
    }
    error.value = err;
  }

  async function fetchMore() {
    await fetch(postList.value?.length ?? 0);
  }

  async function update(post: Post) {
    const ori = postList.value?.find((e) => e.id == post.id);
    if (ori) {
      Object.assign(ori, post);
      return true;
    }
  }

  return {
    init,
    fetch,
    fetchMore,
    update,
    opts,
    initd,
    pending,
    error,
    postList,
    finished,
  };
});
