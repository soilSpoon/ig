import type { NextApiRequest, NextApiResponse } from "next";
import allowMethods from "../../middlewares/allowMethods";
import { supabase } from "../../utils/supabaseClient";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;

  const { error } = await supabase.auth.signIn({ email });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.status(200).json({});
}

export default allowMethods(handler, ["POST"]);
