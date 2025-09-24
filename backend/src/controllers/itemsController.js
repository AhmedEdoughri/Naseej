const { poolPromise, sql } = require("../config/db");

// @desc    Get items with filtering
// @route   GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { status, worker_id } = req.query;
    let query = "SELECT * FROM hwali_items WHERE 1=1";

    if (status) {
      query += ` AND current_status = '${status}'`;
    }
    if (worker_id) {
      query += ` AND assigned_worker_id = '${worker_id}'`;
    }

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update item status
// @route   PATCH /api/items/:id/status
exports.updateItemStatus = async (req, res) => {
  const { to_status, note } = req.body;
  const changed_by_user_id = req.user.userId;
  const { id } = req.params;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // 1. Get the current status
    const itemResult = await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, id)
      .query("SELECT current_status FROM hwali_items WHERE id = @id");

    if (itemResult.recordset.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    const from_status = itemResult.recordset[0].current_status;

    // 2. Update the item's status
    await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, id)
      .input("to_status", sql.VarChar, to_status)
      .query(
        "UPDATE hwali_items SET current_status = @to_status, LastUpdated = GETDATE() WHERE id = @id"
      );

    // 3. Log the status change in history
    await new sql.Request(transaction)
      .input("item_id", sql.UniqueIdentifier, id)
      .input("from_status", sql.VarChar, from_status)
      .input("to_status", sql.VarChar, to_status)
      .input("changed_by_user_id", sql.UniqueIdentifier, changed_by_user_id)
      .input("note", sql.Text, note)
      .query(
        "INSERT INTO status_history (item_id, from_status, to_status, changed_by_user_id, note) VALUES (@item_id, @from_status, @to_status, @changed_by_user_id, @note)"
      );

    await transaction.commit();
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign worker or driver to an item
// @route   PATCH /api/items/:id/assign
exports.assignItem = async (req, res) => {
  const { worker_id, driver_id } = req.body;
  const { id } = req.params;

  try {
    let query = "UPDATE hwali_items SET ";
    if (worker_id) query += `assigned_worker_id = '${worker_id}'`;
    if (driver_id) query += `assigned_driver_id = '${driver_id}'`;
    query += " WHERE id = @id";

    const pool = await poolPromise;
    await pool.request().input("id", sql.UniqueIdentifier, id).query(query);

    res.status(200).json({ message: "Item assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
