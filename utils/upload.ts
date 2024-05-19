import { nanoid } from 'nanoid';
import { SupabaseClient } from '@supabase/supabase-js';

export async function uploadByFile(supa: SupabaseClient, file: File) {
  const bucket = await supa.storage.from('uploads');
  const id = nanoid();
  const { data, error } = await bucket.upload(id, file);
  if (error) {
    console.error('Upload failed', error);
    return {
      success: 0,
    };
  }
  const { data: { publicUrl }} = bucket.getPublicUrl(data.path);
  return {
    success: 1,
    file: {
      url: publicUrl,
    },
  };
}

export async function uploadByUrl(url: string) {
  return {
    success: 1,
    file: {
      url: '',
    },
  };
}
