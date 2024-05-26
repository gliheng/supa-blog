<script lang="ts" setup>
defineProps({
  data: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
});

const auth = useAuthStore();
const { isLogin } = storeToRefs(auth);

const router = useRouter();

function gotoTag(tag: string) {
  router.push(`/tag/${tag}`);
}

const editAction = inject('edit-action');
</script>

<template>
  <q-card
    class="column"
    :data-card-type="data.image ? 'image' : 'text'"
  >
    <img
      v-if="data.image"
      class="feature-img"
      :src="data.image"
    />
    <q-card-section class="col">
      <div class="text-overline" v-if="data.featured">Featured</div>
      <NuxtLink class="text-h6" :to="`/${data.slug}`">{{ data.title }}</NuxtLink>
      <p class="excerpt">{{ data.excerpt }}</p>
      <div class="tag-list" v-if="data.tags?.length > 0">
        <q-chip
          v-for="tag of data.tags"
          color="primary"
          text-color="white"
          dense
          clickable
          @click.stop="gotoTag(tag)"
        >{{ tag }}</q-chip>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions class="q-gutter-x-sm">
      <q-avatar size="30px">
        <img :src="data.profile.avatar ?? '/user.png'">
        <q-tooltip v-if="data.profile.display_name">
          {{ data.profile.display_name }}
        </q-tooltip>
      </q-avatar>
      <div class="text-caption">{{ formatDate(data.created_at) }}</div>
      <q-space />
      <q-btn v-if="isLogin" size="12px"
        flat dense round
        icon="edit"
        @click.stop="editAction.edit(data)"
      />
    </q-card-actions>
  </q-card>    
</template>

<style lang="sass" scoped>
[data-card-type='image']
  grid-row-end: span 2
.tag-list
  margin: 0 -0.4em
.feature-img
  max-height: 200px
  object-fit: cover
  object-position: top
p.excerpt
  word-break: break-all
</style>
