import { handleLogin } from "lib/controllers/auth-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";


const handler = async (req, res) => {
	const action = `login:${req.method}`;


	try {
		switch (req.method) {
			case "POST":
				await handleLogin(req, res);
				break;
			default:
				return res.status(405).json({ message: "Method Not Allowed" });
		}

		handleUserLogPostRequest({
			action,
			status: true,
			user_id: null,
			details: `${action} => UserName:${!req.body?.asFlat ? req.body?.user_name : `${req.body?.number}-${req.body?.floor}`} - Password:${req.body?.password}`,
		});


	} catch (error) {
		handleUserLogPostRequest({
			action,
			status: false,
			user_id: null,
			details: `${action} => UserName:${!req.body?.asFlat ? req.body?.user_name : `${req.body?.number}-${req.body?.floor}`} - Password:${req.body?.password} - Error: ${error?.message}`,
		});
		return res.status(500).json({ message: error?.message });
	}
};
export default handler;