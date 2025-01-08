import { getTransactions, handleStockMovement, updateStockMovement, handleDeleteRequest } from "lib/controllers/transactions-controller";

const handler = async (req, res) => {
  const { method, body, query } = req;
  try {
    switch (method) {
      case "GET":
        await getTransactions(req, res);
        break;
      case "POST":
        await handleStockMovement(body, res);
        break;;
      case "PUT":
        await updateStockMovement(body, res);
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