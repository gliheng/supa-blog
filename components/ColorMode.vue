<template>
  <q-btn
    flat
    :icon="icon"
    :color="$q.dark.isActive ? 'black' : 'white'"
    :text-color="$q.dark.isActive ? 'white' : 'black'"
    @click="toggle"
  >
    <q-tooltip>{{ modeLabel }}</q-tooltip>
  </q-btn>
</template>

<script setup>
const $q = useQuasar()

const icon = computed(() => {
  const { mode } = $q.dark;
  if (mode == 'auto') {
    return 'auto_awesome';
  } else if (mode) {
    return 'mode_night';
  } else {
    return 'light_mode';
  }
});

const modeLabel = computed(() => {
  const { mode } = $q.dark;
  if (mode == 'auto') {
    return 'Auto';
  } else if (mode) {
    return 'Dark';
  } else {
    return 'Light';
  }
});

function toggle() {
  const { mode } = $q.dark;
  let state;
  if (mode == 'auto') {
    state = false;
  } else if (mode) {
    state = 'auto';
  } else {
    state = true;
  }
  $q.dark.set(state);
}
</script>

<style>
body {
  background-color: #fff;
  color: rgba(0,0,0,0.8);
}
.dark-mode body {

  background-color: #091a28;
  color: #ebf4f1;
}
.sepia-mode body {
  background-color: #f1e7d0;
  color: #433422;
}
</style>
