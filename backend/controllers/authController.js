import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ---------------------------
// Helper: Generate JWT Token
// ---------------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tier: user.tier },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @route   GET /api/auth/me
// @access  Public (but requires cookie token)
export const getMe = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "لم يتم تسجيل الدخول" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "رمز الدخول غير صالح" });
  }
};

// ---------------------------
// @desc    Admin & Client Login
// @route   POST /api/auth/login
// @access  Public
// ---------------------------
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(401)
        .json({ message: "خطأ في اسم المستخدم أو كلمة المرور" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "خطأ في اسم المستخدم أو كلمة المرور" });

    const token = generateToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          phoneNumber: user.phoneNumber,
          tier: user.tier,
          role: user.role,
          totalDebt: user.totalDebt || 0,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Create new user
// @route   POST /api/auth/users
// @access  Admin
// ---------------------------
export const createUser = async (req, res) => {
  const {
    username,
    password,
    name,
    phoneNumber,
    tier = "Retail",
    role = "client",
  } = req.body;

  try {
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ message: "اسم المستخدم موجود مسبقاً" });

    const user = new User({
      username,
      password,
      name,
      phoneNumber,
      tier,
      role,
    });

    await user.save();

    res.status(201).json({ message: "تم إنشاء المستخدم", user });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    const query = {};

    // 🔍 Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // 👤 Role filter
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Get single user by ID
// @route   GET /api/auth/users/:id
// @access  Admin
// ---------------------------
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Admin
// ---------------------------
export const updateUser = async (req, res) => {
  const { username, password, name, phoneNumber, tier, role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    if (username) user.username = username;
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (tier) user.tier = tier;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "تم تحديث المستخدم",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Admin
// ---------------------------
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    await User.deleteOne({ _id: user._id });

    res.json({ message: "تم حذف المستخدم" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Update profile (self)
// @route   PUT /api/auth/profile
// @access  Client / Admin (self)
// ---------------------------
export const updateProfile = async (req, res) => {
  const { name, phoneNumber, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: "تم تحديث الملف الشخصي",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        phoneNumber: user.phoneNumber,
        tier: user.tier,
        role: user.role,
        totalDebt: user.totalDebt || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Update user's totalDebt manually
// @route   PUT /api/auth/users/:id/settle-debt
// @access  Admin
// ---------------------------
export const settleDebt = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    if (typeof amount !== "number")
      return res.status(400).json({ message: "قيمة المبلغ غير صالحة" });

    user.totalDebt = amount;
    await user.save();

    res.json({ message: "تم تحديث الديون بنجاح", user });
  } catch (error) {
    console.error("❌ Settle Debt Error:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Public
// ---------------------------
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
};
