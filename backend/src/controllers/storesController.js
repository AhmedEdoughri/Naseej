const { poolPromise, sql } = require("../config/db");

// @desc    Get all stores with their associated user data
// @route   GET /api/stores
exports.getStores = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        s.id as store_id, 
        s.name as storeName, 
        s.address, 
        s.city,
        s.notes as storeNotes,
        u.id as userId,
        u.name as contact_name, 
        u.phone as contact_phone,
        u.email as contact_email,
        u.status,
        u.user_id 
      FROM stores s
      JOIN users u ON s.user_id = u.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'customer')
      ORDER BY s.name
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- THIS IS THE MISSING FUNCTION ---
// @desc    Get a single store by ID
// @route   GET /api/stores/:id
exports.getStoreById = async (req, res) => {
  try {
    const pool = await poolPromise;
    // Updated query to join with the users table
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id).query(`
        SELECT 
          s.id as store_id, 
          s.name as storeName, 
          s.address, 
          s.city,
          s.notes as storeNotes,
          u.id as userId,
          u.name as contact_name, 
          u.phone as contact_phone,
          u.email as contact_email,
          u.status,
          u.user_id 
        FROM stores s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update an existing store and its associated user
// @route   PUT /api/stores/:id
exports.updateStore = async (req, res) => {
  const { name, phone, storeName, address, city, notes } = req.body;
  const storeId = req.params.id;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const storeResult = await new sql.Request(transaction)
      .input("storeId", sql.UniqueIdentifier, storeId)
      .query("SELECT user_id FROM stores WHERE id = @storeId");

    if (storeResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Store not found" });
    }
    const userId = storeResult.recordset[0].user_id;

    await new sql.Request(transaction)
      .input("userId", sql.UniqueIdentifier, userId)
      .input("name", sql.VarChar, name)
      .input("phone", sql.VarChar, phone)
      .query(
        "UPDATE users SET name = @name, phone = @phone WHERE id = @userId"
      );

    await new sql.Request(transaction)
      .input("storeId", sql.UniqueIdentifier, storeId)
      .input("storeName", sql.VarChar, storeName)
      .input("address", sql.Text, address)
      .input("city", sql.VarChar, city)
      .input("notes", sql.Text, notes)
      .query(
        "UPDATE stores SET name = @storeName, address = @address, city = @city, notes = @notes WHERE id = @storeId"
      );

    await transaction.commit();

    res.status(200).json({ message: "Store and user updated successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a store AND its associated user
// @route   DELETE /api/stores/:id
exports.deleteStore = async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const storeResult = await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("SELECT user_id FROM stores WHERE id = @id");

    const userId =
      storeResult.recordset.length > 0
        ? storeResult.recordset[0].user_id
        : null;

    const deleteResult = await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM stores WHERE id = @id");

    if (deleteResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Store not found or already deleted" });
    }

    if (userId) {
      await new sql.Request(transaction)
        .input("userId", sql.UniqueIdentifier, userId)
        .query("DELETE FROM users WHERE id = @userId");
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Store and associated user deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
