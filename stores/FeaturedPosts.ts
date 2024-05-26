import { defineStore } from 'pinia';

export const useFeaturedPostsStore = defineStore('featured-posts', () => {
  const auth = useAuthStore();
  const supa = useSupabase();
  const postList = ref<Post[] | undefined>();
  const pending = ref(false);
  const error = ref();

  async function fetch() {
    if (pending.value || postList.value) return;

    const query = () => {
      let q = supa.from('post')
        .select(postFields + ',profile(avatar, display_name)')
        .eq('featured', true);
      if (!auth.isLogin) {
        q = q.eq('draft', false);
      }
      return q;
    };

    pending.value = true;
    
    const { data, error: err } = await query()
      .order('created_at', {
        ascending: false,
      })

    pending.value = false;

    if (data) {
      postList.value = data as unknown as Post[];
    }
    error.value = err;
  }

  async function update(post: Post) {
    const ori = postList.value?.find((e) => e.id == post.id);
    if (ori) {
      Object.assign(ori, post);
      return true;
    }
  }

  return {
    fetch,
    update,
    pending,
    error,
    postList,
  };
});
