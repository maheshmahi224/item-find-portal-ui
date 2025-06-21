const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

router.post("/add", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
