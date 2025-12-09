import { supabase } from '../supabaseClient';

export const deletePost = async (postUUID: string) => {
  const { error } = await supabase.from('posts').delete().eq('id', postUUID);
  if (error) throw error;
};

export const updatePost = async (postUUID: string, changes: { title?: string; content_text?: string }) => {
  const { error } = await supabase.from('posts').update(changes).eq('id', postUUID);
  if (error) throw error;
};