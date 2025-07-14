import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({ success: true, userData: newUser, token, message: "Account created successfully" });

  } catch (error) {
    console.log("Signup error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);
    res.json({ success: true, userData, token, message: "Login successful" });

  } catch (error) {
    console.log("Login error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check auth
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;
    let updatedData = { fullName, bio };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.log("Update profile error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
