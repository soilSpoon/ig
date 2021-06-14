import type { NextApiRequest, NextApiResponse } from "next";

type Method = string;

/**
 * Adds `cookie` function on `res.cookie` to set cookies for response
 */
const allowMethods =
  (
    handler: (req: NextApiRequest, res: NextApiResponse) => void,
    allowedMethods: Method[]
  ) =>
  (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
    if (method === undefined) {
      console.log("어질어질하네...", req, res);
    } else if (!allowedMethods.includes(method)) {
      res.setHeader("Allow", allowedMethods);
      res.status(405).end(`Method ${method} Not Allowed`);
    }

    return handler(req, res);
  };

export default allowMethods;
