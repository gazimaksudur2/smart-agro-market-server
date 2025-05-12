import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
	// Check for token in cookies first
	const cookieToken = req.cookies.jwt;

	// Check for token in authorization header
	const authHeader = req.headers.authorization;
	let headerToken;
	if (authHeader) {
		headerToken = authHeader.split(" ")[1];
	}

	// Use token from cookie or header
	const token = cookieToken || headerToken;

	if (!token) {
		return res.status(401).json({ message: "Unauthorized access" });
	}

	jwt.verify(
		token,
		process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key",
		(err, decoded) => {
			if (err) {
				return res.status(403).json({ message: "Forbidden access" });
			}
			req.decoded = decoded;
			next();
		}
	);
};

export const verifyRole = (roles) => {
	return (req, res, next) => {
		const userRole = req.decoded.role;
		if (!roles.includes(userRole)) {
			return res.status(403).json({ message: "Forbidden access" });
		}
		next();
	};
};
