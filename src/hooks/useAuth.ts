import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DEV_MOCK_USER } from "@/lib/devProfile";

// DEV MODE: Bypass auth in local/dev builds
const DEV_BYPASS_AUTH = import.meta.env.DEV;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In dev mode, use mock user
    if (DEV_BYPASS_AUTH) {
      setUser(DEV_MOCK_USER as unknown as User);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (DEV_BYPASS_AUTH) {
      // In dev mode, just reload the page
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}