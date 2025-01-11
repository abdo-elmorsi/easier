import { getUserFromToken } from "helper/apis/helpers";
import { handleUpdatePassword } from "lib/controllers/auth-controller";


const handler = async (req, res) => {

	try {
		if (req.method === "POST") {
			getUserFromToken(req);
			await handleUpdatePassword(req, res);
		} else {
			res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message || "An internal server error occurred." });
	}
};
export default handler;