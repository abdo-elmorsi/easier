import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/towers-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const action = `tower:${req.method}`;

  const user = await getToken({ req, secret: process.env.JWT_SECRET });
  // if (!user?.id && !user_email) return res.status(401).json({ message: "Unauthorized" });

  req.user = user;

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
        user_id: user?.id,
        details: `${action} => tower_id:${user?.tower_id} ${req.body?.id || req.body?.name}`,
      });
    }

  } catch (error) {
    handleUserLogPostRequest({
      action,
      status: false,
      user_id: user?.id,
      details: `tower_id:${user?.tower_id} - statusCode:${error.statusCode || 500} message:${error?.message || "An unexpected error occurred."}`,
    });
    return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
  }
};

export default handler;