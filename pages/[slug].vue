<script lang="ts" setup>
const route = useRoute();

const { slug } = route.params;

const showPostDialog = ref(false);
const editPost = ref(null);

function showEditPost(post) {
  showPostDialog.value = true;
  editPost.value = post;
}

const store = usePostStore();
const blogPost = ref();
const router = useRouter();
function onEdit(blog) {
  store.update(blog);
  if (blog.slug != slug) {
    // Slug is updated
    router.replace(`/${blog.slug}`);
  } else {
    blogPost.value.refresh();
  }
}

function onDelete() {
  router.replace('/');
}
</script>

<template>
  <BlogPost
    ref="blogPost"
    :slug="slug"
    @edit="showEditPost"
  />
  <ClientOnly>
    <EditorDialog
      v-model="showPostDialog"
      :edit="editPost"
      @edit="onEdit"
      @delete="onDelete"
    />
  </ClientOnly>
</template>

<style lang="scss" scoped>

</style>
