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

<style lang="scss" src="/assets/style.scss"></style>
