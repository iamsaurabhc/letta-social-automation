import axios from 'axios';
import { createSupabaseClient } from '@common/supabase/client';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001') + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

export default api;