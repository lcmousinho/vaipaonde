import { supabase } from "./supabase-client";

export async function getUserPremiumStatus() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      loggedIn: false,
      isPremium: false,
      email: null,
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  return {
    loggedIn: true,
    isPremium: data?.is_premium ?? false,
    email: user.email ?? null,
  };
}