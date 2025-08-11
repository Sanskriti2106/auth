const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  createUserByEmailAndPassword,
} = require("../services/user.service");

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password, storedHash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return storedHash === hashVerify;
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "Email is already in use." });
  }

  try {
    const { salt, hash } = hashPassword(password);

    const user = await createUserByEmailAndPassword({
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registration successful",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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

  const isMatch = verifyPassword(password, user.passwordHash, user.passwordSalt);
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
    user: { id: user.id, email: user.email },
    token,
  });
}

async function profile(req, res) {
  const user = await findUserByEmail(req.user.email);
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
