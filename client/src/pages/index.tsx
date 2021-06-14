import { Session } from "@supabase/gotrue-js";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Account from "../components/Account";
import Login from "../components/Login";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(supabase.auth.session());

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return session === null ? <Login /> : <Account />;
}
