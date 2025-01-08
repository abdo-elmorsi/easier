import { handleDeleteRequest, handleGetRequest, handlePostRequest, handlePutRequest } from "lib/controllers/units-controller";

const handler = async (req, res) => {
  const { method, query, body } = req;
  try {
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