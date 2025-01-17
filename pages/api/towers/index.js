import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/towers-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {

  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    req.user_id = token.id;
    req.role = token.role;

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
        res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "An internal server error occurred." });
  }
};
export default handler