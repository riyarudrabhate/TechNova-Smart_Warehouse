const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../middleware/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/warehouses - Get all warehouses
router.get("/", protect, (req, res) => {
  try {
    const db = readDB();
    res.json(db.warehouses);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /api/warehouses - Add new warehouse
router.post("/", protect, (req, res) => {
  try {
    const { name, location, capacity, type, manager, status } = req.body;

    if (!name || !location || !capacity) {
      return res.status(400).json({ message: "Name, location and capacity are required." });
    }

    const db = readDB();

    const newWarehouse = {
      id: "WH" + String(db.warehouses.length + 1).padStart(2, "0"),
      name,
      location,
      capacity: Number(capacity),
      used: 0,
      type: type || "Dry Storage",
      manager: manager || "",
      status: status || "Active",
      createdAt: new Date().toISOString(),
    };

    db.warehouses.push(newWarehouse);
    writeDB(db);

    res.status(201).json(newWarehouse);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/warehouses/:id - Update warehouse
router.put("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.warehouses.findIndex((w) => w.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Warehouse not found." });
    }

    db.warehouses[index] = {
      ...db.warehouses[index],
      ...req.body,
      id: req.params.id,
      capacity: Number(req.body.capacity) || db.warehouses[index].capacity,
    };

    writeDB(db);
    res.json(db.warehouses[index]);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/warehouses/:id - Delete warehouse
router.delete("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.warehouses.findIndex((w) => w.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Warehouse not found." });
    }

    db.warehouses.splice(index, 1);
    writeDB(db);

    res.json({ message: "Warehouse deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
