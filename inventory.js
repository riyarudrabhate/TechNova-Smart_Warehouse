const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../middleware/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/inventory - Get all inventory items
router.get("/", protect, (req, res) => {
  try {
    const db = readDB();
    res.json(db.inventory);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /api/inventory - Add new inventory item
router.post("/", protect, (req, res) => {
  try {
    const { warehouseId, produce, qty, unit, storageDate, shelfLife, idealTempMin, idealTempMax, currentTemp, humidity } = req.body;

    if (!warehouseId || !produce || !qty || !storageDate) {
      return res.status(400).json({ message: "Warehouse, produce, quantity and storage date are required." });
    }

    const db = readDB();

    // Check warehouse exists
    const warehouse = db.warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found." });
    }

    const newItem = {
      id: "INV" + Date.now(),
      warehouseId,
      produce,
      qty: Number(qty),
      unit: unit || "kg",
      storageDate,
      shelfLife: Number(shelfLife) || 90,
      idealTempMin: Number(idealTempMin) || 15,
      idealTempMax: Number(idealTempMax) || 25,
      currentTemp: Number(currentTemp) || 20,
      humidity: Number(humidity) || 60,
      createdAt: new Date().toISOString(),
    };

    db.inventory.push(newItem);

    // Update warehouse used capacity
    const whIndex = db.warehouses.findIndex((w) => w.id === warehouseId);
    db.warehouses[whIndex].used += Number(qty);

    writeDB(db);

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.inventory.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Inventory item not found." });
    }

    const oldQty = db.inventory[index].qty;
    const newQty = Number(req.body.qty) || oldQty;

    db.inventory[index] = {
      ...db.inventory[index],
      ...req.body,
      id: req.params.id,
      qty: newQty,
    };

    // Update warehouse used capacity
    const whIndex = db.warehouses.findIndex((w) => w.id === db.inventory[index].warehouseId);
    if (whIndex !== -1) {
      db.warehouses[whIndex].used = db.warehouses[whIndex].used - oldQty + newQty;
    }

    writeDB(db);
    res.json(db.inventory[index]);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.inventory.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Inventory item not found." });
    }

    const item = db.inventory[index];

    // Update warehouse used capacity
    const whIndex = db.warehouses.findIndex((w) => w.id === item.warehouseId);
    if (whIndex !== -1) {
      db.warehouses[whIndex].used = Math.max(0, db.warehouses[whIndex].used - item.qty);
    }

    db.inventory.splice(index, 1);
    writeDB(db);

    res.json({ message: "Inventory item deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
