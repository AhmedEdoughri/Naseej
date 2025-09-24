const { poolPromise, sql } = require("../config/db");

// @desc    Get all stores
// @route   GET /api/stores
exports.getStores = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM stores ORDER BY name");
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single store by ID
// @route   GET /api/stores/:id
exports.getStoreById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("SELECT * FROM stores WHERE id = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new store
// @route   POST /api/stores
exports.createStore = async (req, res) => {
  const { name, contact_name, contact_phone, address, city, notes } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("contact_name", sql.VarChar, contact_name)
      .input("contact_phone", sql.VarChar, contact_phone)
      .input("address", sql.Text, address)
      .input("city", sql.VarChar, city)
      .input("notes", sql.Text, notes)
      .query(
        "INSERT INTO stores (name, contact_name, contact_phone, address, city, notes) OUTPUT INSERTED.* VALUES (@name, @contact_name, @contact_phone, @address, @city, @notes)"
      );

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- NEW ---
// @desc    Update an existing store
// @route   PUT /api/stores/:id
exports.updateStore = async (req, res) => {
  const { name, contact_name, contact_phone, address, city, notes } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .input("name", sql.VarChar, name)
      .input("contact_name", sql.VarChar, contact_name)
      .input("contact_phone", sql.VarChar, contact_phone)
      .input("address", sql.Text, address)
      .input("city", sql.VarChar, city)
      .input("notes", sql.Text, notes)
      .query(
        "UPDATE stores SET name = @name, contact_name = @contact_name, contact_phone = @contact_phone, address = @address, city = @city, notes = @notes WHERE id = @id"
      );

    res.status(200).json({ message: "Store updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- NEW ---
// @desc    Delete a store
// @route   DELETE /api/stores/:id
exports.deleteStore = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM stores WHERE id = @id");

    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    // Handle potential foreign key constraint errors if a store is in use
    if (error.number === 547) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete this store because it is associated with existing users or pickup requests.",
        });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
