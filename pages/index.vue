<script lang="ts" setup>
const auth = useAuthStore();
const type = ref('published');
</script>

<template>
  <div class="q-mb-md">
    <q-btn-toggle
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      v-if="auth.isLogin"
      v-model="type"
      toggle-color="primary"
      :options="[
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ]"
    />
  </div>
  <BlogListPage :type="type" />
</template>
