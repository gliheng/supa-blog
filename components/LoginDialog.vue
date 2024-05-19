<script lang="ts" setup>
const showLogin = defineModel();

const email = ref('');
const password = ref('');

const auth = useAuthStore();
const loginPending = ref(false);
const loginForm = ref();
const loginError = ref();

async function onLogin() {
  const success = await loginForm.value.validate();
  if (success) {
    loginPending.value = true;
    const { data, error } = await auth.login({
      email: email.value,
      password: password.value,
    });

    loginPending.value = false;
    if (error) {
      loginError.value = error;
    } else {
      showLogin.value = false;
      // reset form after login
      email.value = '';
      password.value = '';
    }
  }
}

</script>

<template>
  <q-dialog v-model="showLogin">
    <q-card class="login-card">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-form ref="loginForm" @submit="onLogin">
        <q-card-section class="q-mx-lg">
          <q-input
            v-model="email"
            label="Email"
            autocomplete="username"
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          >
            <template v-slot:prepend>
              <q-icon name="password" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section v-if="loginError" class="text-white bg-red">
          {{ loginError.message }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            type="submit"
            :loading="loginPending">Login</q-btn>
          <q-btn label="Close" flat v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.login-card
  width: 360px
</style>
