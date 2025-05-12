import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ message: "Unauthorized access" });
	}
	const token = authHeader.split(" ")[1];
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
