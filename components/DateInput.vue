<template>
  <q-input
    v-model="date"
    mask="date"
    :rules="['date']"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date v-model="date">
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Close"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts" setup>
import moment from 'moment';

const model = defineModel();

const date = computed({
  set(v) {
    const d = moment(v, 'YYYY/MM/DD').toDate();
    model.value = d;
  },
  get() {
    return moment(model.value).format('YYYY/MM/DD');
  },
});
</script>

<style lang="scss" scoped>
  
</style>