const { poolPromise, sql } = require("../config/db");

// @desc    Create a request

// @route   POST /api/requests

exports.createRequest = async (req, res) => {
  const { items, notes, total_qty, deadline, inbound_option, outbound_option } =
    req.body;

  const requested_by_user_id = req.user.userId;

  const pool = await poolPromise;

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(); // --- 1. Find the store linked to this user ---

    const storeResult = await new sql.Request(transaction)

      .input("user_id", sql.UniqueIdentifier, requested_by_user_id)

      .query("SELECT id FROM stores WHERE user_id = @user_id");

    if (!storeResult.recordset[0]) {
      await transaction.rollback();

      return res.status(400).json({ message: "No store found for this user" });
    }

    const store_id = storeResult.recordset[0].id; // --- 2. Insert request and set initial status to 'Pending Approval' ---

    const requestResult = await new sql.Request(transaction)

      .input("store_id", sql.UniqueIdentifier, store_id)

      .input("requested_by_user_id", sql.UniqueIdentifier, requested_by_user_id)

      .input("notes", sql.Text, notes)

      .input("total_qty", sql.Int, total_qty)

      .input("deadline", sql.Date, deadline)

      .input("inbound_option", sql.VarChar, inbound_option)

      .input("outbound_option", sql.VarChar, outbound_option)

      .input("status", sql.VarChar, "Pending Approval") // Set the initial status here
      .query(`

        INSERT INTO requests

          (store_id, requested_by_user_id, notes, total_qty, deadline, inbound_option, outbound_option, status)

        OUTPUT INSERTED.id

        VALUES

          (@store_id, @requested_by_user_id, @notes, @total_qty, @deadline, @inbound_option, @outbound_option, @status)

      `);

    const requestId = requestResult.recordset[0].id; // --- 3. Insert items if provided ---

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

// @desc    Get requests

// @route   GET /api/requests

exports.getRequests = async (req, res) => {
  try {
    const pool = await poolPromise;

    let query = "SELECT * FROM requests"; // Start with the base query

    const whereClauses = []; // Always exclude cancelled, unless you're an admin who wants to see them

    if (req.user.role !== "admin") {
      whereClauses.push("status <> 'cancelled'");
    }

    if (req.user.role === "customer") {
      const storeResult = await pool

        .request()

        .input("user_id", sql.UniqueIdentifier, req.user.userId)

        .query("SELECT id FROM stores WHERE user_id = @user_id");

      if (storeResult.recordset.length > 0) {
        const store_id = storeResult.recordset[0].id;

        whereClauses.push(`store_id = '${store_id}'`);
      } else {
        return res.status(200).json([]);
      }
    } else if (req.user.role === "manager") {
      // Managers should see requests pending their approval

      whereClauses.push("status = 'Pending Approval'");
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY deadline ASC";

    const result = await pool.request().query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error in getRequests:", error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- NEW FUNCTIONS FOR APPROVAL ---

const updateRequestStatus = async (res, requestId, newStatus) => {
  const pool = await poolPromise;

  try {
    // Fetch request details first
    const requestResult = await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, requestId).query(`
        SELECT inbound_option, outbound_option, status
        FROM requests
        WHERE id = @requestId
      `);

    if (!requestResult.recordset[0]) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { inbound_option, outbound_option } = requestResult.recordset[0];

    // Start with the requested status
    let finalStatus = newStatus;

    // --- Automatic transitions ---
    if (newStatus === "Approved") {
      if (inbound_option === "customer_dropoff") {
        finalStatus = "Awaiting Drop-off"; // auto move to drop-off
      }
      // If it's business pickup, manager will later trigger manually
    }

    if (newStatus === "Preparing Order") {
      if (outbound_option === "customer_pickup") {
        finalStatus = "Ready for Pickup"; // auto move to ready
      }
      // If it's delivery, manager triggers manually
    }

    // Update status in DB
    await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, requestId)
      .input("status", sql.VarChar, finalStatus)
      .query("UPDATE requests SET status = @status WHERE id = @requestId");

    res.status(200).json({
      message: `Request status updated to ${finalStatus}`,
      newStatus: finalStatus,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.approveRequest = (req, res) => {
  updateRequestStatus(res, req.params.id, "Approved");
};

exports.rejectRequest = (req, res) => {
  updateRequestStatus(res, req.params.id, "Rejected");
};

// ------------------------------------

exports.cancelRequest = (req, res) => {
  updateRequestStatus(res, req.params.id, "cancelled");
};

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
