import { supabase } from "@/lib/supabase";

export const authService = {
  async login(credentials: any) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },

  async register(userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/auth/login';
  },

  async getProfile() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata.full_name,
      ...user.user_metadata,
    };
  }
};
