<script lang="ts" setup>
defineProps({
  data: Array as PropType<Record<string, any>[]>,
});
</script>

<template>
  <main>
    <BlogCard 
      v-for="post in data"
      :key="post.id"
      :data="post"
    />
  </main>
</template>

<style lang="sass" scoped>
main
  display: grid
  gap: 16px
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr))
.tag-list
  margin: 0 -0.4em
.feature-img
  max-height: 200px
  object-fit: cover
  object-position: top
</style>
