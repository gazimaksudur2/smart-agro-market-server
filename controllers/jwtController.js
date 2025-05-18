import jwt from "jsonwebtoken";

// Generate a JWT and save it in a cookie
export const generateToken = async (req, res) => {
  try {
    const { uid, email, role } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: uid, email, role: role || "consumer" },
      process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key",
      { expiresIn: "1d" }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      partitioned: true, // Not yet supported in Express as of May 2025
      path: "/",
    };

    // Set JWT as a cookie
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Token generated and stored in cookie",
      user: { id: uid, email, role: role || "consumer" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify the JWT from cookie
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found in cookie",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key"
    );

    res.status(200).json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Clear the JWT cookie (logout)
export const clearToken = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Token cleared from cookie",
  });
};
