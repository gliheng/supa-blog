<script lang="ts" setup>
const showLogin = ref(false);

const blogConfig = useAppConfig().blog;

const auth = useAuthStore();
const { userInfo, user } = storeToRefs(auth);

const showProfile = ref(false);
function onShowProfile() {
  showProfile.value = true;
}

function onLogout() {
  const { error } = auth.logout();
}

const store = usePostsStore();
const featuredStore = useFeaturedPostsStore();
const showPostDialog = ref(false);
const editPost = ref<Post>();
provide('edit-action', {
  create() {
    showPostDialog.value = true;
    editPost.value = undefined;
  },
  edit(post: Post) {
    showPostDialog.value = true;
    editPost.value = post;
  },
});

function onAdd(post: Post) {
  if (!featuredStore.update(post)) {
    store.fetch();
  }
}

function onEdit(post: Post) {
  if (!featuredStore.update(post)) {
    store.update(post);
  }
}

function onDelete(post: Post) {
  if (!featuredStore.update(post)) {
    store.fetch();
  }
}
</script>

<template>
  <q-layout view="hHh lpR fFf" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
    <q-header
      reveal
      elevated
      :class="$q.dark.isActive ? 'bg-black text-grey-1' : 'bg-white text-grey-8'"
      height-hint="64"
    >
      <q-toolbar class="blogger__toolbar q-gutter-x-sm">
        <q-btn flat no-caps no-wrap v-if="$q.screen.gt.xs" :to="{name: 'home'}">
          <RouterLink class="blogger__title" to="/">
            <q-toolbar-title
              shrink
              class="text-weight-bold"
              :class=" $q.dark.isActive ? 'text-white' : 'text-black'"
            >
              {{ blogConfig?.title }}
            </q-toolbar-title>
          </RouterLink>
        </q-btn>

        <q-btn
          v-for="link of blogConfig?.links"
          stretch
          flat
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'"
          :label="link.label"
          :href="link.url"
        />

        <q-space />

        <SearchInput />

        <ColorMode />
        <q-btn-dropdown v-if="userInfo" flat>
          <template #label>
            <div class="q-gutter-x-sm">
              <q-avatar style="font-size: 24px">
                <img :src="userInfo.avatar" />
              </q-avatar>
              <span>
                {{ userInfo.displayName ?? user.email }}              
              </span>
            </div>
          </template>
          <template #default>
            <q-list>
              <q-item clickable v-close-popup @click="onShowProfile">
                <q-item-section>
                  <q-item-label>Profile</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onLogout">
                <q-item-section>
                  <q-item-label>Logout</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-btn-dropdown>
        <q-btn flat v-else @click="showLogin = true">Login</q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding class="column items-stretch justify-stretch">
        <slot></slot>
      </q-page>
    </q-page-container>

    <footer class="q-pa-lg text-center q-gutter-x-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
      <span class="text-subtitle1" v-if="blogConfig.footer">{{ blogConfig?.footer }}</span>
      <span class="text-subtitle2">Powered by supa-blog</span>
    </footer>
  </q-layout>
  <LoginDialog v-model="showLogin" />
  <ProfileDialog v-model="showProfile" />
  <ClientOnly>
    <EditorDialog
      v-model="showPostDialog"
      :edit="editPost"
      @add="onAdd"
      @edit="onEdit"
      @delete="onDelete"
    />
  </ClientOnly>
</template>

<style lang="sass" scoped>
.blogger
  &__toolbar
    height: 56px
  &__title
    text-decoration: none !important
</style>
