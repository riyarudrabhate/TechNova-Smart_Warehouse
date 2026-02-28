const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../middleware/db");
const { SECRET } = require("../middleware/auth");

const router = express.Router();

// ── REGISTER ──────────────────────────────────────────
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const db = readDB();

    // Check if email already exists
    const existing = db.users.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create avatar initials
    const avatar = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashed,
      role: role || "Warehouse Manager",
      avatar,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, avatar: newUser.avatar }, SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = readDB();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
