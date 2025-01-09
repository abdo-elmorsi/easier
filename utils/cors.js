// utils/cors.js
import Cors from 'cors';

const cors = Cors({
	origin: 'http://localhost:3000', // Allow requests from your frontend
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
	credentials: true, // Allow credentials
});

// Middleware runner
function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
}

export default cors;
export { runMiddleware };
