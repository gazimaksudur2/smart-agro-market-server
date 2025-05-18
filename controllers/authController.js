import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new user
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNumber,
      address,
      firebaseUID,
      profilePicture,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        userId: existingUser._id,
      });
    }

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "consumer",
      phoneNumber,
      address,
      firebaseUID,
      profilePicture,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key",
      { expiresIn: "1d" }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "none",
      partitioned: true, // Not yet supported in Express as of May 2025
      path: "/",
    };

    // Set JWT as a cookie
    res.cookie("jwt", token, cookieOptions);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Regular email/password login
    // console.log(email);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if password exists (for OAuth users)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Please login with Google or Facebook",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "smart_agro_connect_jwt_super_secret_key",
      { expiresIn: "1d" }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "none",
      partitioned: true, // Not yet supported in Express as of May 2025
      path: "/",
    };

    // Set JWT as a cookie
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user
// export const logout = (req, res) => {
//   res.clearCookie("jwt", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//   });

//   res.status(200).json({
//     success: true,
//     message: "Logged out successfully",
//   });
// };

// Get user data
export const getUserWithEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "-password"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify an user
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
	res.status(200).json({success: true, message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user role
export const updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate role
    const validRoles = ["admin", "agent", "seller", "consumer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all agents
export const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent", verified: true }).select(
      "-password"
    );

    res.status(200).json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get agent by region
export const getAgentByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const agent = await User.findOne({
      role: "agent",
      region,
      verified: true,
    }).select("-password");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "No agent found for this region",
      });
    }

    res.status(200).json({
      success: true,
      agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
