<script setup lang="ts">
import { debounce } from 'lodash-es';

interface Option {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

const search = ref('')
const options: Ref<Option[] | null> = ref(null);
const supa = useSupabase();

watch(search, (val) => {
  if (val) {
    const key = val.replace(/\s+/g, '&');
    query(key);
  } else {
    options.value = null;
  }
});

let abortController: AbortController | null = null;
const query = debounce((val) => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  abortController = new AbortController();
    supa.rpc('search_post', {
      key: val,
    }).select('id,slug,title,created_at')
      .abortSignal(abortController.signal)
      .then(({ data }) => {
        if (data) {
          options.value = data;
        }
      });
});

function onKeydown(evt: KeyboardEvent) {
  switch (evt.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      evt.preventDefault();
      break;
    case 'Enter':
      evt.preventDefault();
  }
}

function clearSearch() {
  search.value = '';
  options.value = null;
}

const hasFocus = ref(false);
function onFocusin() {
  hasFocus.value = true;
}

let focusTimer: ReturnType<typeof setTimeout>;
function onFocusout() {
  clearTimeout(focusTimer);
  focusTimer = setTimeout(() => {
    hasFocus.value = false;
  }, 200);
}

const router = useRouter();
function go(opt: Option) {
  router.push(`/${opt.slug}`);
  hasFocus.value = false;
}
</script>

<template>
  <div
    class="wrapper"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <q-input
      class="input"
      outlined
      dense
      filled
      v-model.trim="search"
      color="bg-grey-7"
      placeholder="Search for articles"
      @keydown="onKeydown"
    >
      <template v-slot:prepend>
        <q-icon v-if="search === ''" name="search" />
        <q-icon v-else name="clear" class="cursor-pointer" @click="clearSearch" />
      </template>
    </q-input>
    <q-card
      v-if="hasFocus && options"
      class="results"
    >
      <q-card-section>
        <q-list v-if="options.length">
          <q-item
            v-for="opt of options"
            :key="opt.id"
            clickable
            @mousedown.prevent
            @click="go(opt)"
          >
            <q-item-section>
              <q-item-label v-html="opt.title" />
            </q-item-section>
            <q-item-section sdie>
              <q-item-label
                caption
                v-html="formatDate(opt.created_at)"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else>
          No results match that query
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="sass" scoped>
.wrapper
  position: relative
.input
  width: 14rem
.results
  position: absolute
  z-index: 1
  width: 100%
  max-height: 60vh
  overflow-y: auto
</style>