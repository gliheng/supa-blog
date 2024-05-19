<script lang="ts" setup>
import type { Post } from '@/index';

const showPostDialog = ref(false);
const editPost = ref<Post>();

const props = defineProps({
  type: String,
  tag: String,
});
const store = usePostStore();
const auth = useAuthStore();

const initAction = store.init({
 type: props.type,
 tag: props.tag,
});

// Only wait on the server, so data is serialized to the client
if (process.server) {
  await initAction;
}

watch(() => [props.type, props.tag], ([type, tag]) => {
  store.init({
    type,
    tag,
  })
});

function onAdd(post: Post) {
  store.fetch();
}

function onEdit(post: Post) {
  store.update(post);
}

function onDelete(post: Post) {
  store.fetch();
}

function showCreatePost() {
  showPostDialog.value = true;
  editPost.value = undefined;
}

function showEditPost(post: Post) {
  showPostDialog.value = true;
  editPost.value = post;
}

const loaderRef = ref();
const cacheExtent = 100;
function onScroll() {
  if (loaderRef.value.getBoundingClientRect().top < document.documentElement.clientHeight + cacheExtent) {
    store.fetchMore();
  }
}

async function onRefresh(done: () => void) {
  await store.fetch();
  done();
}
</script>

<template>
  <Loading v-if="!store.initd" />
  <div v-else-if="store.error">{{ store.error }}</div>
  <div class="col flex items-center justify-center" v-else-if="store.postList?.length === 0">
    <p>Create your first post now</p>
  </div>
  <q-pull-to-refresh
    v-else
    @refresh="onRefresh"
  >
    <BlogList
      :data="store.postList"
      @edit="showEditPost"
    />
    <div class="q-py-lg"
      v-if="!store.finished"
      ref="loaderRef"
      v-scroll="onScroll"
    >
      <Loading />
    </div>
  </q-pull-to-refresh>
  <ClientOnly>
    <EditorDialog
      v-model="showPostDialog"
      :edit="editPost"
      @add="onAdd"
      @edit="onEdit"
      @delete="onDelete"
    />
    <q-page-sticky v-if="auth.isLogin"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn fab icon="add" color="accent" @click="showCreatePost" />
    </q-page-sticky>
  </ClientOnly>
</template>
