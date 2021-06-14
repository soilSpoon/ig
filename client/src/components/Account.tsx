import { supabase } from "../utils/supabaseClient";

export default function Account() {
  const user = supabase.auth.user();

  console.log(user);
  return <>Hello World</>;
}
