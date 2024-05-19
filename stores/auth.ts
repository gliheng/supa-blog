import { defineStore } from 'pinia';
import { Session, User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  let session = ref<Session>();
  let user = ref<User>();

  const supa = useSupabase();

  return {
    session,
    user,

    isLogin: computed(() => !!user.value),
    userInfo: computed(() => {
      const u = user.value;
      if (u) {
        return {
          displayName: u.user_metadata.displayName,
          avatar: u.user_metadata.avatar,
        };
      }
    }),

    async login(params) {
      const { data, error } = await supa.auth.signInWithPassword(params);
      if (data) {
        session.value = data.session;
        user.value = data.user;
      }
      return { data, error };
    },

    async logout() {
      const { data, error } = await supa.auth.signOut();
      if (!error) {
        session.value = null;
        user.value = null;
      }
      return { data, error };
    },

    async restore() {
      const {
        data: { subscription },
      } = supa.auth.onAuthStateChange((_event, sess) => {
        console.log('session update:', sess);
        if (sess) {
          session.value = sess;
          user.value = sess.user;
        } else {
          session.value = null;
          user.value = null;
        }
      });

      const { data, error } = await supa.auth.getSession();

      if (error) {

      } else if (data.session) {
        session.value = data.session;
        user.value = data.session.user;
      }

      // subscription.unsubscribe()
      return subscription;
    },
  };
});
