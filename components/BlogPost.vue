<script lang="ts" setup>
import EasyLightBox from 'vue-easy-lightbox';
import { getHighlighter } from 'shiki'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});

defineEmits(['edit']);

defineExpose({
  refresh() {
    refresh();
  },
});

const contentRef = ref<HTMLElement>();

const { slug } = props;

const supa = useSupabase();

const { pending, data, error, refresh } = await useLazyAsyncData(`post-${slug}`, async () => {
  const { data, error } = await supa.from('post')
    .select('*, profile(avatar, display_name)')
    .eq('slug', props.slug);
  if (error) throw error;
  return data;
});
const post = computed(() => data.value?.[0]);

onUpdated(() => {
  const codeBlocks = contentRef.value?.querySelectorAll('code');
  if (codeBlocks) {
    for (const code of codeBlocks) {
      activateSyntax(code as any);
    }
  }
});

async function activateSyntax(el: HTMLElement & { initd: boolean }) {
  if (el.initd) {
    return;
  }

  // This highlight code block imported from ghost
  const match = /language-(\w+)/.exec(el.className);
  if (match) {
    const lang = match[1]!;
    const highlighter = await getHighlighter({
      themes: ['nord'],
      langs: [],
    });

    if (lang) {
      await highlighter.loadLanguage(lang as any);
  
      const code = highlighter.codeToHtml(el.textContent, {
        lang,
        theme: 'nord'
      });
  
      el.innerHTML = code;
      el.initd = true;
    }
  }
}

const auth = useAuthStore();
const { isLogin } = storeToRefs(auth);

const router = useRouter();
function gotoTag(tag: string) {
  router.push(`/tag/${tag}`);
}

const lightbox = reactive({
  visible: false,
  imgs: [] as string[],
  index: 0,
  initd: false,
});

function onContentClick(evt: MouseEvent) {
  const target = evt.target as HTMLElement;
  if (target.tagName == 'IMG') {
    // lazy add images
    if (!lightbox.initd) {
      lightbox.imgs = [
        ...(evt.currentTarget as HTMLElement).getElementsByTagName('img')
      ].map(img => img.src).filter(e => !!e);
      lightbox.initd = true;
    }
    const idx = lightbox.imgs.indexOf((target as HTMLImageElement).src);
    if (idx != -1) {
      lightbox.visible = true;
      lightbox.index = idx;
    }
  }
}
</script>

<template>
  <Loading v-if="pending" />
  <section v-else-if="error">
    {{ error }}
  </section>
  <section v-else-if="post" class="q-gutter-y-md">
    <q-btn size="12px"
      v-if="isLogin"
      icon="edit"
      label="Edit"
      @click.stop="$emit('edit', post)"
    />
    <h1 class="text-h6">
      {{ post.title }}
    </h1>
    <div class="row items-center q-gutter-x-sm">
      <div>
        <q-avatar size="30px">
          <img :src="post.profile.avatar ?? '/user.png'">
        </q-avatar>
        <span>{{ post.profile.display_name }}</span>
      </div>
      <time class="text-caption">{{ formatDate(post.updated_at) }}</time>
    </div>
    <main
      ref="contentRef"
      :data-format="post.format"
      v-html="post.html"
      @click.capture="onContentClick"
    />
    <div class="tag-list">
      <q-chip color="primary" text-color="white"
        dense clickable
        v-for="tag of post.tags"
        @click="gotoTag(tag)"
      >{{ tag }}</q-chip>
    </div>
  </section>
  <ClientOnly>
    <EasyLightBox
      :visible="lightbox.visible"
      :imgs="lightbox.imgs"
      :index="lightbox.index"
      @hide="lightbox.visible = false"
    />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.tag-list {
  margin: 0 -0.4em
}
main {
  :deep() {
    h1, h2, h3, h4, h5, h6 {
      line-height:2rem;
    }
    h1 {
      font-size: 1.6rem;
      font-weight: 600;
    }
    h2 {
      font-size:1.5rem;
      font-weight:600;
    }
    h3 {
      font-size:1.4rem;
      font-weight:500;
    }
    h4 {
      font-size:1.3rem;
      font-weight:500;
    }
    h5 {
      font-size:1.2rem;
      font-weight:400;
    }
    h6 {
      font-size:1.1rem;
      font-weight:400;
    }
    table {
      table {
        border-collapse: collapse;
        td {
          border: 1px solid silver;
          padding: 0.2rem 0.4rem;
        }
      }
    }
    figure.fig-img {
      img {
        max-width: 100%;
      }
    }
  }
}
</style>
