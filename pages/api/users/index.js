import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/users-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const { method, query, body } = req;
  try {
    const user = await getToken({ req, secret: process.env.JWT_SECRET });

    req.user = user;

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

    return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
  }
};
export default handler