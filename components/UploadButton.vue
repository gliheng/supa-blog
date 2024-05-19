<template>
  <q-btn @click="onClick">
    <input
      ref="fileRef"
      class="file-input"
      type="file"
      @change="$emit('select', $event)"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
    />
    <slot></slot>
  </q-btn>
</template>

<script lang="ts" setup>
defineProps({
  accept: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select']);

const fileRef = ref();

function onClick() {
  fileRef.value.click();
}
</script>

<style lang="sass" scoped>
.file-input
  display: none
</style>
