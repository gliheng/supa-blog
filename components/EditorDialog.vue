<script lang="ts" setup>
import genSlug from 'slug';
import { omitBy, isUndefined } from 'lodash-es';
import Editor from '@/components/Editor';

const props = defineProps({
  edit: Object,
});

const show = defineModel({
  type: Boolean,
});
const emit = defineEmits(['add', 'edit', 'delete']);

const loading = ref(false);
const editMode = computed(() => !!props.edit);

const title = ref();
const editor = ref();
const draft = ref(false);
const featured = ref(false);
const tags = ref();
const image = ref<string | null | undefined>();

const slug = ref();
const excerpt = ref();
const createdAt = ref();

const editingEnabled = computed(() => {
  return !editMode.value || props.edit?.format == 'editorjs';
});

function reset() {
  let post = props.edit;
  title.value = post?.title ?? '';
  draft.value = post?.draft ?? false;
  featured.value = post?.featured ?? false;
  tags.value = post?.tags?.concat() ?? undefined;
  image.value = post?.image ?? undefined;
  slug.value = post?.slug ?? undefined;
  excerpt.value = post?.excerpt ?? undefined;
  createdAt.value = post?.created_at ?? undefined;
}

watch(show, async (show) => {
  if (show) {
    reset();
    if (props.edit) {
      loading.value = true;

      const { data, error } = await supa.from('post')
        .select('*')
        .eq('id', props.edit.id)
        .single();
      
      loading.value = false;

      if (error) {
        $q.notify({
          message: `Cannot fetch post content: ${error}`,
          color: 'red',
        });
      } else {
        await nextTick();
        editor.value?.setData({
          content: data.content,
          html: data.html,
        });
      }
    }
  }
});

const supa = useSupabase();
const { data: tagData, error: err } = await supa.from('tags')
  .select('tags');

const stringOptions = tagData?.map(e => e.tags) ?? [];
const filterOptions = ref(stringOptions);

function createTagValue(val, done) {
  if (val.length) {
    if (!stringOptions.includes(val)) {
      done(val, 'add-unique');
    }
  }
}

function filterFn(val, update) {
  update(() => {
    if (val === '') {
      filterOptions.value = stringOptions;
    } else {
      const needle = val.toLowerCase();
      filterOptions.value = stringOptions.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  })
}

const $q = useQuasar();
async function sendPost() {
  if (loading.value) {
    $q.notify({
      message: 'Please wait for post to load',
      color: 'red',
    });
    return;
  }

  const { content, html } = (await editor.value?.getData()) ?? '';
  const row: Record<string, any> = {
    title: title.value,
    draft: draft.value,
    featured: featured.value,
    tags: tags.value,
    image: image.value,
    slug: slug.value || genSlug(title.value),
    excerpt: excerpt.value || genExcerpt(html, 500),
    content,
    html,
  };
  
  omitBy(row, isUndefined);
  
  let fn;
  if (editMode.value) {
    fn = 'update_post';
  } else {
    fn = 'create_post';
    row.format = 'editorjs';
    row.created_at = createdAt.value;
  }
  const { data, error } = await supa.rpc(fn, { rec: row, id: props.edit?.id })
    .select(postFields)
    .single();

  if (error) {
    $q.notify({
      message: error.message,
      color: 'red',
    });
    return;
  }

  show.value = false;
  emit(editMode.value ? 'edit' : 'add', data);
}

function genExcerpt(s: string, len: number) {
  const node = document.createElement('div');
  node.innerHTML = s;
  const text = node.textContent ?? '';
  return text.trim().replace(/\s+/g, ' ').substring(0, len);
}

const imageUploading = ref(false);
async function onUploadImage(evt: InputEvent) {
  const fileObj = evt.target.files[0];
  if (!fileObj) {
    $q.notify({
      message: 'Please select a file for upload',
      color: 'red',
    });
    return;
  }
  imageUploading.value = true;
  const { success, file } = await uploadByFile(supa, fileObj);
  imageUploading.value = false;
  if (success && file) {
    image.value = file.url;
  }
}

function deletePost() {
  const post = props.edit;
  if (!post || !post.id) return;

  $q.dialog({
    title: 'Confirm delete',
    message: `Really delete post "${post.title}"?`,
    cancel: true,
  }).onOk(async () => {
    const { error } = await supa.from('post')
      .delete()
      .eq('id', post.id)

    if (error) {
      $q.notify({
        message: `Delete error: ${error}`,
        color: 'red',
      });
      return;
    }

    show.value = false;
    emit('delete', post);
  }).onCancel(() => {
  }).onDismiss(() => {
  })
}
</script>

<template>
  <q-dialog
    v-model="show"
    full-width
    full-height
    persistent
  >
    <q-card class="dialog-content column full-height">
      <q-toolbar class="bg-purple text-white shadow-2 rounded-borders">
        <q-toolbar-title>Post editor</q-toolbar-title>
        <q-space />
        <q-btn v-if="editMode" icon="delete" flat @click="deletePost" />
        <q-btn icon="close" flat v-close-popup />
      </q-toolbar>
      <q-card-section>
        <div class="title-input text-h6">
          <q-input
            v-model="title"
            label="Title"
            filled
            dense
          >
            <template v-slot:after>
              <q-btn-dropdown
                class="send-btn"
                flat
                icon="send"
              >
                <q-card style="width: 400px">
                  <q-card-section>
                    <q-form class="q-gutter-md">
                      <div>
                        <q-toggle
                          v-model="draft"
                          label="Draft"
                        />
                        <q-toggle
                          v-model="featured"
                          label="Featured"
                        />
                      </div>
                      <q-select
                        class="q-mt-md"
                        label="Tags"
                        filled
                        v-model="tags"
                        use-input
                        use-chips
                        dense
                        multiple
                        input-debounce="0"
                        @new-value="createTagValue"
                        :options="filterOptions"
                        @filter="filterFn"
                      />
                      <q-file
                        label="Feature image"
                        accept="image/*"
                        dense
                        filled
                        clearable
                        @input="onUploadImage"
                      >
                      </q-file>
                      <div class="feature-img" v-if="imageUploading || image">
                        <q-icon
                          name="close"
                          @click="image = null"
                          class="cursor-pointer close-icon"
                        />
                        <q-spinner
                          v-if="imageUploading"
                          color="primary"
                          size="3em"
                        />
                        <img v-else :src="image" />
                      </div>
                    </q-form>
                  </q-card-section>
                  <q-card-section class="more-section">
                    <q-form>
                      <q-expansion-item
                        icon="tune"
                        label="More options"
                        header-class="text-primary"
                      >
                        <q-card class="column">
                          <q-card-section class="q-gutter-md">
                            <q-input
                            v-model="slug"
                            label="Slug"
                            filled
                            dense
                            />
                            <q-input
                              v-model="excerpt"
                              label="Excerpt"
                              type="textarea"
                              filled
                              dense
                            />
                            <DateInput
                              v-model="createdAt"
                              label="Update time"
                              filled
                              dense
                            />
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-form>
                  </q-card-section>
                  <q-card-section class="text-center">
                    <q-btn
                      :label="editMode ? 'Save' : 'Publish'"
                      icon="publish"
                      @click="sendPost"
                    />
                  </q-card-section>
                </q-card>
              </q-btn-dropdown>
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-section v-if="!show || loading" class="col column">
        <Loading />
      </q-card-section>
      <q-card-section v-else-if="editingEnabled" class="col scroll">
        <Editor ref="editor" />
      </q-card-section>
      <q-card-section v-else class="col column scroll justify-center items-center">
        <p class="text-grey-8 text-subtitle1 q-ma-none">Content editing disabled</p>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.dialog-content
  min-width: 800px
  width: 50vw
  max-width: 1000px
.title-input
  max-width: 650px
  margin: 0 auto
.send-btn
  :deep(.q-btn-dropdown__arrow)
    display: none
.more-section
  margin-top: -16px
.feature-img
  height: 100px
  position: relative
  display: flex
  align-items: center
  justify-content: center
  .close-icon
    position: absolute
    top: 0
    right: 0
  img
    height: 100%
</style>