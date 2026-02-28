const express    = require("express");
const cors       = require("cors");
const authRoutes = require("./routes/auth");
const warehouseRoutes = require("./routes/warehouses");
const inventoryRoutes = require("./routes/inventory");
const shipmentRoutes  = require("./routes/shipments");

const app  = express();
const PORT = 5000;

// ── MIDDLEWARE ────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Handle preflight OPTIONS requests
app.options("*", cors());

// ── ROUTES ────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory",  inventoryRoutes);
app.use("/api/shipments",  shipmentRoutes);

// ── HEALTH CHECK ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "AgriVault API is running ✅", port: PORT });
});

// ── START SERVER ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ AgriVault Backend running at http://localhost:${PORT}`);
});