const { poolPromise, sql } = require("../config/db");

// @desc    Create a request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  const { items, notes, total_qty, deadline, inbound_option, outbound_option } =
    req.body;
  const requested_by_user_id = req.user.userId;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // --- 1. Find the store linked to this user ---
    const storeResult = await new sql.Request(transaction)
      .input("user_id", sql.UniqueIdentifier, requested_by_user_id)
      .query("SELECT id FROM stores WHERE user_id = @user_id");

    if (!storeResult.recordset[0]) {
      await transaction.rollback();
      return res.status(400).json({ message: "No store found for this user" });
    }

    const store_id = storeResult.recordset[0].id;

    // --- 2. Insert request ---
    const requestResult = await new sql.Request(transaction)
      .input("store_id", sql.UniqueIdentifier, store_id)
      .input("requested_by_user_id", sql.UniqueIdentifier, requested_by_user_id)
      .input("notes", sql.Text, notes)
      .input("total_qty", sql.Int, total_qty)
      .input("deadline", sql.Date, deadline)
      .input("inbound_option", sql.VarChar, inbound_option)
      .input("outbound_option", sql.VarChar, outbound_option).query(`
        INSERT INTO requests
          (store_id, requested_by_user_id, notes, total_qty, deadline, inbound_option, outbound_option)
        OUTPUT INSERTED.id
        VALUES
          (@store_id, @requested_by_user_id, @notes, @total_qty, @deadline, @inbound_option, @outbound_option)
      `);

    const requestId = requestResult.recordset[0].id;

    // --- 3. Insert items if provided ---
    if (items && items.length > 0) {
      for (const item of items) {
        await new sql.Request(transaction)
          .input("request_id", sql.UniqueIdentifier, requestId)
          .input("qty", sql.Int, item.qty)
          .input("description", sql.Text, item.description)
          .query(
            "INSERT INTO hwali_items (request_id, qty, description) VALUES (@request_id, @qty, @description)"
          );
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: "Request created successfully",
      request_id: requestId,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get requests
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    const pool = await poolPromise;
    // --- MODIFICATION ---
    // Start with a base query that excludes any cancelled requests.
    let query = "SELECT * FROM requests WHERE status <> 'cancelled'";

    if (req.user.role === "customer") {
      // Find the store_id for the customer
      const storeResult = await pool
        .request()
        .input("user_id", sql.UniqueIdentifier, req.user.userId)
        .query("SELECT id FROM stores WHERE user_id = @user_id");

      if (storeResult.recordset.length > 0) {
        const store_id = storeResult.recordset[0].id;
        // Append the customer-specific condition
        query += ` AND store_id = '${store_id}'`;
      } else {
        // No store found for this customer, so return no requests
        return res.status(200).json([]);
      }
    }

    // Add the ordering at the very end
    query += " ORDER BY deadline ASC";

    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Cancel a request
// @route   PUT /api/requests/:id/cancel
exports.cancelRequest = async (req, res) => {
  const { id } = req.params;
  const pool = await poolPromise;
  try {
    await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, id)
      .query("UPDATE requests SET status = 'cancelled' WHERE id = @requestId");

    res.status(200).json({ message: "Request cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update request notes
// @route   PUT /api/requests/:id/notes
exports.updateRequestNotes = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const pool = await poolPromise;
  try {
    await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, id)
      .input("notes", sql.Text, notes)
      .query("UPDATE requests SET notes = @notes WHERE id = @requestId");

    res.status(200).json({ message: "Notes updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
