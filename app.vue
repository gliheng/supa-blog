<script lang="ts" setup>

const auth = useAuthStore();
onMounted(() => {
  auth.restore();
});

</script>

<template>
  <NuxtLayout>
    <Suspense>
      <NuxtPage />
      <template #fallback>
        <div class="col flex items-center justify-center">
          <q-spinner-ball
            color="primary"
            size="2em"
          />
        </div>
      </template>
    </Suspense>
  </NuxtLayout>
</template>

<style>
:root {
  --affine-z-index-popover: 10000 !important;
}
a {
  color: var(--q-primary);
  text-decoration: none;
}
a:link:hover {
  text-decoration: underline;
}
</style>