<template>
  <q-card v-if="store.postList?.length">
    <q-card-section class="q-pb-none">
      <div class="text-overline text-uppercase">Featured</div>
    </q-card-section>
    <div v-for="(post, i) of store.postList" :key="post.id" class="featured-list-item">
      <div class="focus-helper"></div>
      <q-card-section vertical>
        <q-img
          class="feature-img q-mb-sm"
          v-if="post.image"
          :src="post.image"
        />
        <NuxtLink class="text-h5 q-mt-sm q-mb-xs" :to="`/${post.slug}`">{{ post.title }}</NuxtLink>
        <p class="excerpt">{{ post.excerpt }}</p>
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="30px">
            <img :src="post.profile.avatar ?? '/user.png'">
            <q-tooltip v-if="post.profile.display_name">
              {{ post.profile.display_name }}
            </q-tooltip>
          </q-avatar>
          <span>{{ post.profile.display_name }}</span>
          <time class="text-caption">{{ formatDate(post.created_at) }}</time>
          <q-space />
          <q-btn v-if="isLogin" size="12px"
            flat dense round
            icon="edit"
            @click.stop="editAction.edit(post)"
          />
        </div>
      </q-card-section>
      <q-separator v-if="i != store.postList.length - 1" inset />
    </div>
  </q-card>
</template>

<script lang="ts" setup>
const auth = useAuthStore();
const { isLogin } = storeToRefs(auth);
const editAction = inject('edit-action');

const store = useFeaturedPostsStore();
await store.fetch();
</script>

<style lang="sass" scoped>
.featured-list-item
  position: relative
  .feature-img
    max-height: 200px
    object-fit: cover
    object-position: top
  &:hover .focus-helper
    position: absolute
    inset: 0
    background: currentColor
    opacity: .1
    pointer-events: none
.excerpt
  overflow: hidden
  display: -webkit-box
  -webkit-box-orient: vertical
  -webkit-line-clamp: 5
</style>