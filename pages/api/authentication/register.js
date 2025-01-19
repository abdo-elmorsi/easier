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

		return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
	}
};
export default handler;