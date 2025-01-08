import { handleRegister } from "lib/controllers/auth-controller";


const handler = async (req, res) => {
	const { method, body } = req;
	try {
		if (method === "POST") {
			await handleRegister(body, res);
		} else {
			res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message || "An internal server error occurred." });
	}
};
export default handler;