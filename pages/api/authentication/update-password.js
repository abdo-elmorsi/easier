import { handleUpdatePassword } from "lib/controllers/auth-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";
import { getToken } from "next-auth/jwt";


const handler = async (req, res) => {
	const action = `update_password:${req.method}`;

	const token = await getToken({ req, secret: process.env.JWT_SECRET });
	if (!token) res.status(401).json({ message: "Unauthorized" });

	req.user_id = token.id;
	req.role = token.role;


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
			user_id: token.id,
			details: `${action} =>  OldPassword:${req.body?.oldPassword} - NewPassword:${req.body?.newPassword}`,
		});


	} catch (error) {
		handleUserLogPostRequest({
			action,
			status: false,
			user_id: token.id,
			details: `${action} =>  OldPassword:${req.body?.oldPassword} - NewPassword:${req.body?.newPassword} - Error: ${error?.message}`,
		});
		return res.status(500).json({ message: error?.message });
	}
};
export default handler;