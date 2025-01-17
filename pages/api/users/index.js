import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/users-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const { method, query, body } = req;
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    req.user_id = token.id;
    req.role = token.role;

    switch (method) {
      case "GET":
        await handleGetRequest(query, res);
        break;
      case "POST":
        await handlePostRequest(body, res);
        break;
      case "PUT":
        await handlePutRequest(body, res);
        break;
      case "DELETE":
        await handleDeleteRequest(body, res);
        break;
      default:
        res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "An internal server error occurred." });
  }
};
export default handler