import { supabase } from '../supabaseClient';
import { DateRange } from '../types';

export const getPostsCount = async ({ since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('posts_count_premium', { since_date: since, until_date: until });

    if (error) {
      console.error('Error en posts_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - Posts count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getPostsCount:', error);
    throw error;
  }
};

export const getCommentsCount = async ({ since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('comments_count_premium', { since_date: since, until_date: until });

    if (error) {
      console.error('Error en comments_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - Comments count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getCommentsCount:', error);
    throw error;
  }
};

export const getLikesCount = async ({ since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('likes_count_premium', { since_date: since, until_date: until });

    if (error) {
      console.error('Error en likes_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - Likes count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getLikesCount:', error);
    throw error;
  }
};

export const getUserPostsCount = async (userId: string, { since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('user_posts_count_premium', { 
        user_uuid: userId, 
        since_date: since, 
        until_date: until 
      });

    if (error) {
      console.error('Error en user_posts_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - User Posts count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getUserPostsCount:', error);
    throw error;
  }
};

export const getUserLikesCount = async (userId: string, { since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('user_likes_count_premium', { 
        user_uuid: userId, 
        since_date: since, 
        until_date: until 
      });

    if (error) {
      console.error('Error en user_likes_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - User Likes count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getUserLikesCount:', error);
    throw error;
  }
};

export const getUserCommentsCount = async (userId: string, { since, until }: DateRange): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('user_comments_count_premium', { 
        user_uuid: userId, 
        since_date: since, 
        until_date: until 
      });

    if (error) {
      console.error('Error en user_comments_count_premium:', error);
      throw error;
    }
    
    console.log('📊 Dashboard - User Comments count:', data);
    return data ?? 0;
  } catch (error) {
    console.error('Error en getUserCommentsCount:', error);
    throw error;
  }
};