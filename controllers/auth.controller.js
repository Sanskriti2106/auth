const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} = require("../services/user.service");

function generateToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "Email is already in use." });
  }

 try {
    const user = await createUserByEmailAndPassword({ name, email, password });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "Registration successful",
    user: {
      id: user.id,
      email: user.email,
 },
    token: token,
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password." });
  }

  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Login successful",
user: {
      id: user.id,
      email: user.email,
    },
    token: token,
  });
}

async function profile(req, res) {
  const user = await findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    id: user.id,
    email: user.email,
  });
}

module.exports = {
  register,
  login,
  profile,
};