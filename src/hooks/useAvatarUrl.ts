import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useAvatarUrl = (userId: string | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!userId) return;

    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchAvatar();
  }, [userId]);

  return avatarUrl;
};