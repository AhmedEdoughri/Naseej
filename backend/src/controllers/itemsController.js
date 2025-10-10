const { poolPromise, sql } = require("../config/db");

// @desc    Get items with filtering
// @route   GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { status, worker_id } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    // Use parameterized queries to prevent SQL injection
    let query = "SELECT * FROM hwali_items WHERE 1=1";

    if (status) {
      query += ` AND current_status = @status`;
      request.input("status", sql.VarChar, status);
    }
    if (worker_id) {
      query += ` AND assigned_worker_id = @worker_id`;
      request.input("worker_id", sql.UniqueIdentifier, worker_id);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update item status
// @route   PATCH /api/items/:id/status
exports.updateItemStatus = async (req, res) => {
  const { to_status, note } = req.body; // Note is available but not used in history table
  const changed_by_user_id = req.user.userId;
  const { id: itemId } = req.params;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // 1. Get the item's current status and its parent request ID
    const itemResult = await new sql.Request(transaction)
      .input("itemId", sql.UniqueIdentifier, itemId)
      .query(
        "SELECT current_status, request_id FROM hwali_items WHERE id = @itemId"
      );

    if (itemResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Item not found" });
    }

    const { current_status: previousStatus, request_id: requestId } =
      itemResult.recordset[0];

    // 2. Update the item's status in the hwali_items table
    await new sql.Request(transaction)
      .input("itemId", sql.UniqueIdentifier, itemId)
      .input("to_status", sql.VarChar, to_status)
      .query(
        "UPDATE hwali_items SET current_status = @to_status, LastUpdated = GETUTCDATE() WHERE id = @itemId"
      );

    // 3. Log the status change in the request_status_history table
    await new sql.Request(transaction)
      .input("request_id", sql.UniqueIdentifier, requestId)
      .input("user_id", sql.UniqueIdentifier, changed_by_user_id)
      .input("previous_status", sql.VarChar, previousStatus)
      .input("new_status", sql.VarChar, to_status).query(`
        INSERT INTO request_status_history (request_id, user_id, previous_status, new_status)
        VALUES (@request_id, @user_id, @previous_status, @new_status);
      `);

    await transaction.commit();
    res.status(200).json({ message: "Item status updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating item status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign worker or driver to an item
// @route   PATCH /api/items/:id/assign
exports.assignItem = async (req, res) => {
  const { worker_id, driver_id } = req.body;
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const request = pool.request().input("id", sql.UniqueIdentifier, id);

    // Build query safely
    let queryParts = [];
    if (worker_id) {
      queryParts.push("assigned_worker_id = @worker_id");
      request.input("worker_id", sql.UniqueIdentifier, worker_id);
    }
    if (driver_id) {
      queryParts.push("assigned_driver_id = @driver_id");
      request.input("driver_id", sql.UniqueIdentifier, driver_id);
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: "No assignment provided." });
    }

    const query = `UPDATE hwali_items SET ${queryParts.join(
      ", "
    )} WHERE id = @id`;

    await request.query(query);

    res.status(200).json({ message: "Item assigned successfully" });
  } catch (error) {
    console.error("Error assigning item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
