<script lang="ts" setup>
const props = defineProps({
  type: String,
  tag: String,
  showFeatured: Boolean,
});

const auth = useAuthStore();
const store = usePostsStore();

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

const editAction = inject('edit-action');
</script>

<template>
  <Loading v-if="!store.initd" />
  <div v-else-if="store.error">{{ store.error }}</div>
  <div
    class="col flex items-center justify-center"
    v-else-if="store.postList?.length === 0"
  >
    <p>Create your first post now</p>
  </div>
  <q-pull-to-refresh
    v-else
    @refresh="onRefresh"
  >
    <FeaturedBlogList v-if="showFeatured" class="q-mb-md" />
    <BlogList
      :data="store.postList"
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
    <q-page-sticky v-if="auth.isLogin"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="accent"
        @click="editAction.create"
      />
    </q-page-sticky>
  </ClientOnly>
</template>
