const { poolPromise, sql } = require("../config/db");

// Helper function to log status changes
const logStatusChange = async (
  transaction,
  requestId,
  userId,
  previousStatus,
  newStatus,
  note
) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await poolPromise).request();
  await request
    .input("request_id", sql.UniqueIdentifier, requestId)
    .input("user_id", sql.UniqueIdentifier, userId)
    .input("previous_status", sql.VarChar, previousStatus)
    .input("new_status", sql.VarChar, newStatus)
    .input("note", sql.Text, note) // Add the 'note' input
    .query(`
      INSERT INTO request_status_history (request_id, user_id, previous_status, new_status, note)
      VALUES (@request_id, @user_id, @previous_status, @new_status, @note);
    `);
};

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

    const storeResult = await new sql.Request(transaction)
      .input("user_id", sql.UniqueIdentifier, requested_by_user_id)
      .query("SELECT id FROM stores WHERE user_id = @user_id");

    if (!storeResult.recordset[0]) {
      await transaction.rollback();
      return res.status(400).json({ message: "No store found for this user" });
    }

    const store_id = storeResult.recordset[0].id;
    const initialStatus = "Pending Approval";

    const requestResult = await new sql.Request(transaction)
      .input("store_id", sql.UniqueIdentifier, store_id)
      .input("requested_by_user_id", sql.UniqueIdentifier, requested_by_user_id)
      .input("notes", sql.Text, notes)
      .input("total_qty", sql.Int, total_qty)
      .input("deadline", sql.Date, deadline)
      .input("inbound_option", sql.VarChar, inbound_option)
      .input("outbound_option", sql.VarChar, outbound_option)
      .input("status", sql.VarChar, initialStatus).query(`
        INSERT INTO requests
          (store_id, requested_by_user_id, notes, total_qty, deadline, inbound_option, outbound_option, status)
        OUTPUT INSERTED.id
        VALUES
          (@store_id, @requested_by_user_id, @notes, @total_qty, @deadline, @inbound_option, @outbound_option, @status)
      `);

    const requestId = requestResult.recordset[0].id;

    // Log the initial status creation
    await logStatusChange(
      transaction,
      requestId,
      requested_by_user_id,
      null,
      initialStatus
    );

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
    let query = "SELECT * FROM requests";
    const whereClauses = [];

    if (req.user.role !== "admin") {
      whereClauses.push("status <> 'Cancelled'");
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

const updateRequestStatus = async (req, res, newStatus) => {
  const { note } = req.body;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  const requestId = req.params.id;
  const userId = req.user.userId;

  try {
    await transaction.begin();

    const requestResult = await new sql.Request(transaction).input(
      "requestId",
      sql.UniqueIdentifier,
      requestId
    ).query(`
        SELECT inbound_option, outbound_option, status
        FROM requests
        WHERE id = @requestId
      `);

    if (!requestResult.recordset[0]) {
      await transaction.rollback();
      return res.status(404).json({ message: "Request not found" });
    }

    const {
      inbound_option,
      outbound_option,
      status: previousStatus,
    } = requestResult.recordset[0];
    let finalStatus = newStatus;

    if (newStatus === "Approved") {
      if (inbound_option === "customer_dropoff") {
        finalStatus = "Awaiting Drop-off";
      }
    }

    if (newStatus === "Preparing Order") {
      if (outbound_option === "customer_pickup") {
        finalStatus = "Ready for Pickup";
      }
    }

    await new sql.Request(transaction)
      .input("requestId", sql.UniqueIdentifier, requestId)
      .input("status", sql.VarChar, finalStatus)
      .query("UPDATE requests SET status = @status WHERE id = @requestId");

    // Pass the note to the logging function
    await logStatusChange(
      transaction,
      requestId,
      userId,
      previousStatus,
      finalStatus,
      note // Pass the note here
    );

    await transaction.commit();

    res.status(200).json({
      message: `Request status updated to ${finalStatus}`,
      newStatus: finalStatus,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating request status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single request by its ID with status history
// @route   GET /api/requests/:id
exports.getRequestDetails = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  try {
    const pool = await poolPromise;

    // 1. Fetch the main request details
    const requestResult = await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, id)
      .query("SELECT * FROM requests WHERE id = @requestId");

    if (requestResult.recordset.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const requestDetails = requestResult.recordset[0];

    // Security check: Ensure the user has permission to view this request
    if (role === "customer") {
      const storeResult = await pool
        .request()
        .input("user_id", sql.UniqueIdentifier, userId)
        .query("SELECT id FROM stores WHERE user_id = @user_id");

      const userStoreId = storeResult.recordset[0]?.id;
      if (requestDetails.store_id !== userStoreId) {
        return res.status(403).json({
          message: "Forbidden: You do not have access to this request.",
        });
      }
    }

    // 2. Fetch the status history for that request
    const historyResult = await pool
      .request()
      .input("requestId", sql.UniqueIdentifier, id)
      .query(
        "SELECT * FROM request_status_history WHERE request_id = @requestId ORDER BY changed_at ASC"
      );

    // 3. Combine them into a single response object
    const response = {
      ...requestDetails,
      status_history: historyResult.recordset,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching request details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.approveRequest = (req, res) => {
  updateRequestStatus(req, res, "Approved");
};

exports.rejectRequest = (req, res) => {
  updateRequestStatus(req, res, "Rejected");
};

exports.cancelRequest = (req, res) => {
  updateRequestStatus(req, res, "Cancelled");
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

exports.getOrderHistory = async (req, res) => {
  const { status, search } = req.query;
  const { userId, role } = req.user;

  try {
    const pool = await poolPromise;
    const request = pool.request();
    let query = `
      SELECT
        r.*,
        cancel_hist.note AS cancellation_reason,
        reject_hist.note AS rejection_reason 
      FROM
        requests r
      LEFT JOIN
        request_status_history cancel_hist ON r.id = cancel_hist.request_id AND cancel_hist.new_status = 'Cancelled'
      LEFT JOIN
        request_status_history reject_hist ON r.id = reject_hist.request_id AND reject_hist.new_status = 'Rejected'
    `;
    const whereClauses = [];

    if (role === "customer") {
      const storeResult = await pool
        .request()
        .input("user_id", sql.UniqueIdentifier, userId)
        .query("SELECT id FROM stores WHERE user_id = @user_id");

      if (storeResult.recordset.length === 0) {
        return res.status(200).json([]);
      }
      const store_id = storeResult.recordset[0].id;
      whereClauses.push("store_id = @store_id");
      request.input("store_id", sql.UniqueIdentifier, store_id);
    }

    if (status) {
      whereClauses.push("LOWER(status) = LOWER(@status)");
      request.input("status", sql.VarChar, status.trim());
    }

    if (search) {
      whereClauses.push(
        "(CAST(order_number AS VARCHAR(50)) LIKE @search OR CAST(id AS VARCHAR(36)) LIKE @search)"
      );
      request.input("search", sql.VarChar, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY deadline DESC";

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.dispatchRequest = (req, res) => {
  updateRequestStatus(req, res, "Driver Dispatched");
};

exports.deliverRequest = (req, res) => {
  updateRequestStatus(req, res, "Out for Delivery");
};
