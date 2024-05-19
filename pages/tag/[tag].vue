<script lang="ts" setup>
const route = useRoute();
const tag = route.params.tag as string;
</script>

<template>
  <BlogListPage :tag="tag" />
</template>
