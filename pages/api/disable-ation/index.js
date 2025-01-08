import { handlePostRequest } from "lib/controllers/units-controller";
import moment from "moment-timezone";

const handler = async (req, res) => {
	const { method } = req;
	try {
		switch (method) {
			case "GET":
				await handlePostRequest({ isDisable: true, name: `${moment().format("yyyy-MM-dd HH:mm:ss")}` }, res);
				break;
			default:
				res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message || "An internal server error occurred." });
	}
};
export default handler