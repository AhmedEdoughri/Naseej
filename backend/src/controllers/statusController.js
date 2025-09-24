const { poolPromise, sql } = require("../config/db");

// @desc    Reorder all statuses
// @route   PUT /api/statuses/reorder
// @access  Admin only
exports.reorderStatuses = async (req, res) => {
  const statuses = req.body;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // ✅ FIX: Use a for...of loop to execute updates sequentially
    for (const status of statuses) {
      const request = new sql.Request(transaction);
      await request
        .input("id", sql.Int, status.id)
        .input("display_order", sql.Int, status.display_order)
        .query(
          "UPDATE statuses SET display_order = @display_order WHERE id = @id"
        );
    }

    await transaction.commit();
    res.status(200).json({ message: "Display order updated successfully." });
  } catch (error) {
    // This will now work correctly because no other requests will be in progress
    await transaction.rollback();
    console.error("REORDER STATUSES ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering statuses." });
  }
};

// @desc    Get all statuses
// @route   GET /api/statuses
// @access  Admin only
exports.getStatuses = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM statuses ORDER BY display_order");
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new status
// @route   POST /api/statuses
// @access  Admin only
exports.createStatus = async (req, res) => {
  const { name, description, color, display_order } = req.body;
  try {
    const pool = await poolPromise;

    const orderCheck = await pool
      .request()
      .input("display_order", sql.Int, display_order)
      .query("SELECT id FROM statuses WHERE display_order = @display_order");
    if (orderCheck.recordset.length > 0) {
      return res
        .status(409)
        .json({
          message:
            "This display order is already in use. Please choose another.",
        });
    }

    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("description", sql.Text, description)
      .input("color", sql.VarChar, color)
      .input("display_order", sql.Int, display_order)
      .query(
        "INSERT INTO statuses (name, description, color, display_order) OUTPUT INSERTED.* VALUES (@name, @description, @color, @display_order)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update an existing status
// @route   PUT /api/statuses/:id
// @access  Admin only
exports.updateStatus = async (req, res) => {
  const { name, description, color, display_order } = req.body;
  try {
    const pool = await poolPromise;

    const orderCheck = await pool
      .request()
      .input("display_order", sql.Int, display_order)
      .input("id", sql.Int, req.params.id)
      .query(
        "SELECT id FROM statuses WHERE display_order = @display_order AND id != @id"
      );

    if (orderCheck.recordset.length > 0) {
      return res
        .status(409)
        .json({
          message:
            "This display order is already in use. Please choose another.",
        });
    }

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.VarChar, name)
      .input("description", sql.Text, description)
      .input("color", sql.VarChar, color)
      .input("display_order", sql.Int, display_order)
      .query(
        "UPDATE statuses SET name = @name, description = @description, color = @color, display_order = @display_order WHERE id = @id"
      );
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a status
// @route   DELETE /api/statuses/:id
// @access  Admin only
exports.deleteStatus = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM statuses WHERE id = @id");
    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    if (error.number === 547) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete this status because it is currently in use by one or more items.",
        });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
