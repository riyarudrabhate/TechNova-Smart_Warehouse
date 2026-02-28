const express = require("express");
const { readDB, writeDB } = require("../middleware/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

// GET /api/shipments - Get all shipments
router.get("/", protect, (req, res) => {
  try {
    const db = readDB();
    res.json(db.shipments);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// POST /api/shipments - Add new shipment
router.post("/", protect, (req, res) => {
  try {
    const { warehouseId, destination, items, status, date, driver, eta } = req.body;

    if (!destination || !items) {
      return res.status(400).json({ message: "Destination and items are required." });
    }

    const db = readDB();

    const newShipment = {
      id: "SHP" + String(db.shipments.length + 1).padStart(3, "0"),
      warehouseId: warehouseId || "",
      destination,
      items,
      status: status || "Pending",
      date: date || new Date().toISOString().split("T")[0],
      driver: driver || "",
      eta: eta || "TBD",
      createdAt: new Date().toISOString(),
    };

    db.shipments.push(newShipment);
    writeDB(db);

    res.status(201).json(newShipment);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// PUT /api/shipments/:id - Update shipment
router.put("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.shipments.findIndex((s) => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    db.shipments[index] = { ...db.shipments[index], ...req.body, id: req.params.id };
    writeDB(db);

    res.json(db.shipments[index]);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// DELETE /api/shipments/:id - Delete shipment
router.delete("/:id", protect, (req, res) => {
  try {
    const db = readDB();
    const index = db.shipments.findIndex((s) => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    db.shipments.splice(index, 1);
    writeDB(db);

    res.json({ message: "Shipment deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
