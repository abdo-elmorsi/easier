import { getTowerBalances } from "lib/controllers/reports-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
	const user = await getToken({ req, secret: process.env.JWT_SECRET });
	if (!user?.id) return res.status(401).json({ message: "Unauthorized" });

	req.user = user;

	try {
		switch (req.method) {
			case "GET":
				await getTowerBalances(req, res);
				break;
			default:
				res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {

		return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
	}
};
export default handler
