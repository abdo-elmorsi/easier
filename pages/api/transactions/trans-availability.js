import { getTransactions } from "lib/controllers/trans-availability-controller";

const handler = async (req, res) => {
	try {
		switch (req.method) {
			case "GET":
				await getTransactions(req, res);
				break;
			default:
				res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message || "An internal server error occurred." });
	}
};
export default handler
