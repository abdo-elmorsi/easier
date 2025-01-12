
import jwt from "jsonwebtoken";

// Handle error response
export const handleErrorResponse = (error, res) => {
  const errorMessage = error?.response?.data?.message || "An error occurred while fetching data.";

  if (error?.response?.status === 401) {
    // Clear the user token cookie
    res.setHeader('Set-Cookie', 'user-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');


    // Respond with unauthorized status
    res.status(401).json({ message: "Your session has expired, please login again" });
  } else {
    // Respond with the received status or a default 500 status
    res.status(error?.response?.status || 500).json({ message: errorMessage });
  }
};

// Helpers
export const getUserFromToken = (req, res) => {
  try {
    const token = req.cookies["user-token"];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user_id = decoded.userId;
    req.role = decoded.role;
  } catch (error) {
    return res.status(401).json({ error: "Invalid credentials or password provided to JWT" });

  }
};
