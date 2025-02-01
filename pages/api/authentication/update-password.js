import { handleUpdatePassword } from "lib/controllers/auth-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";
import { getToken } from "next-auth/jwt";


const handler = async (req, res) => {
	const action = `update_password:${req.method}`;

	const token = await getToken({ req, secret: process.env.JWT_SECRET });
	if (!token) return res.status(401).json({ message: "Unauthorized" });

	req.user = user;



	try {
		switch (req.method) {
			case "POST":
				await handleUpdatePassword(req, res);
				break;
			default:
				return res.status(405).json({ message: "Method Not Allowed" });
		}

		handleUserLogPostRequest({
			action,
			status: true,
			user_id: user?.id,
			details: `${action} =>  OldPassword:${req.body?.oldPassword} - NewPassword:${req.body?.newPassword}`,
		});


	} catch (error) {
		handleUserLogPostRequest({
			action,
			status: false,
			user_id: user?.id,
			details: `${action} =>  OldPassword:${req.body?.oldPassword} - NewPassword:${req.body?.newPassword} - statusCode:${error.statusCode || 500} message:${error?.message || "An unexpected error occurred."}`,
		});
		return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
	}
};
export default handler;