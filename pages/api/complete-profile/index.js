import { handleGetRequest, handlePutRequest } from "lib/controllers/complete-profile-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";

const handler = async (req, res) => {
  const action = `complete_profile:${req.method}`;

  try {

    switch (req.method) {
      case "GET":
        await handleGetRequest(req, res);
        break;
      case "PUT":
        await handlePutRequest(req, res);
        break;
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Log success for non-GET requests
    if (req.method !== "GET") {
      handleUserLogPostRequest({
        action,
        status: true,
        user_id: null,
        details: `${action} => Name${req.body?.user_name} - Email:${req.body?.email} - Phone:${req.body?.phone}`,
      });
    }

  } catch (error) {
    handleUserLogPostRequest({
      action,
      status: false,
      user_id: null,
      details: `statusCode:${error.statusCode || 500} message:${error?.message || "An unexpected error occurred."}`,
    });
    return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
  }
};

export default handler;
