<template>
  <q-dialog v-model="show">
    <q-card class="dialog-content">
      <q-toolbar class="bg-purple text-white shadow-2 rounded-borders">
        <q-toolbar-title>Profile</q-toolbar-title>
        <q-space />
        <q-btn icon="close" flat v-close-popup />
      </q-toolbar>
      <q-card-section class="q-gutter-y-lg">
        <div class="text-center">
          <UploadButton
            round
            color="white"
            accept="image/*"
            @select="onSelect"
          >
            <q-avatar size="50px">
              <img :src="avatar ?? '/user.png'">
            </q-avatar>
          </UploadButton>
        </div>
        <q-input
          v-model.trim="displayName"
          label="Display name"
          dense
          filled
        />
      </q-card-section>
      <q-card-actions align="center">
        <q-btn color="accent" :loading="saving" @click="onSave">Save</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
const show = defineModel();

const store = useAuthStore();

const displayName = ref();
const avatar = ref();

watch(show, v => {
  if (v) {
    displayName.value = store.userInfo?.displayName;
    avatar.value = store.userInfo?.avatar;
  }
})

const supa = useSupabase();

async function onSelect(evt: InputEvent) {
  const { success, file } = await uploadByFile(supa, evt.target.files[0]);
  if (success && file) {
    avatar.value = file.url;
  }
}

const $q = useQuasar();
const saving = ref(false);
async function onSave() {
  saving.value = true;
  
  const { error } = await supa.auth.updateUser({
    data: {
      displayName: displayName.value,
      avatar: avatar.value,
    },
  });
  if (error) {
    $q.notify({
      message: error.message,
      color: 'red',
    });
  }
  show.value = false;
  saving.value = false;
}
</script>

<style lang="sass" scoped>
.dialog-content
  width: 300px
</style>
