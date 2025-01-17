import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/estimated-expenses-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const action = `estimated_expenses:${req.method}`;

  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) res.status(401).json({ message: "Unauthorized" });

  req.user_id = token.id;
  req.role = token.role;

  try {

    switch (req.method) {
      case "GET":
        await handleGetRequest(req, res);
        break;
      case "POST":
        await handlePostRequest(req, res);
        break;
      case "PUT":
        await handlePutRequest(req, res);
        break;
      case "DELETE":
        await handleDeleteRequest(req, res);
        break;
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Log success for non-GET requests
    if (req.method !== "GET") {
      handleUserLogPostRequest({
        action,
        status: true,
        user_id: token.id,
        details: `${action} => ${req.body?.id || req.body?.name}`,
      });
    }

  } catch (error) {
    handleUserLogPostRequest({
      action,
      status: false,
      user_id: token.id,
      details: error?.message
    });
    return res.status(500).json({ message: error?.message });
  }
};

export default handler;
