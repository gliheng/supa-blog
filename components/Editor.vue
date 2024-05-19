<template>
  <div class="col" ref="elRef"></div>
</template>

<script lang="ts" setup>
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Delimiter from '@editorjs/delimiter';
import Link from '@editorjs/link';
import Embed from '@editorjs/embed';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';

const supa = useSupabase();

const elRef = ref();
let editor, pickupData;
onMounted(() => {
  editor = new EditorJS({
    holder: elRef.value,
    inlineToolbar: ['bold', 'italic', 'marker', 'inlineCode', 'link'],
    tools: {
      header: Header,
      list: List,
      table: Table,
      image: {
        class: Image,
        config: {
          uploader: {
            uploadByFile: uploadByFile.bind(null, supa),
            uploadByUrl,
          },
        },
      },
      checklist: Checklist,
      quote: Quote,
      code: Code,
      warning: Warning,
      marker: Marker,
      inlineCode: InlineCode,
      delimiter: Delimiter,
      linkTool: Link,
      embed: Embed,
    },
    onReady() {
      if (pickupData) {
        editor.render(pickupData);
      }
      console.log('Editor.js is ready to work!');
    },
    onChange(api, event) {
      console.log('Editor\'s content changed!', event)
    },
    autofocus: true,
    placeholder: 'Let`s write an awesome story!',
  });
});

defineExpose({
  async getData() {
    const saved = await editor.save();
    return saved;
  },
  setData(data: { content: string }) {
    if (editor.render) {
      editor.render(data.content);
    } else {
      pickupData = data.content;
    }
  },
});
</script>

<style scoped>
  
</style>