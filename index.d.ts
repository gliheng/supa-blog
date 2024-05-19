declare module 'nuxt/schema' {
  interface AppConfigInput {
    supabase?: {
      project: string;
      anon: string;
    };
    blog?: {
      title?: string;
      footer?: string;
      links?: { label: string; url: string }[];
      pageSize?: number;
    };
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
