const { poolPromise, sql } = require("../config/db");

// @desc    Create a pickup request
// @route   POST /api/pickups
exports.createPickupRequest = async (req, res) => {
  const { store_id, items, notes, pickup_date } = req.body;
  const requested_by_user_id = req.user.userId;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // 1. Create the pickup_request
    const requestResult = await new sql.Request(transaction)
      .input("store_id", sql.UniqueIdentifier, store_id)
      .input("requested_by_user_id", sql.UniqueIdentifier, requested_by_user_id)
      .input("pickup_date", sql.Date, pickup_date)
      .input("notes", sql.Text, notes)
      .query(
        "INSERT INTO pickup_requests (store_id, requested_by_user_id, pickup_date, notes) OUTPUT INSERTED.id VALUES (@store_id, @requested_by_user_id, @pickup_date, @notes)"
      );

    const pickupRequestId = requestResult.recordset[0].id;

    // 2. Create the associated hwali_items
    for (const item of items) {
      await new sql.Request(transaction)
        .input("pickup_request_id", sql.UniqueIdentifier, pickupRequestId)
        .input("qty", sql.Int, item.qty)
        .input("description", sql.Text, item.description)
        .query(
          "INSERT INTO hwali_items (pickup_request_id, qty, description) VALUES (@pickup_request_id, @qty, @description)"
        );
    }

    await transaction.commit();
    res.status(201).json({
      message: "Pickup request created successfully",
      pickup_request_id: pickupRequestId,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all pickup requests
// @route   GET /api/pickups
exports.getPickupRequests = async (req, res) => {
  try {
    const pool = await poolPromise;
    let query = "SELECT * FROM pickup_requests";

    // If user is a 'store' user, only show their requests
    if (req.user.role === "customer") {
      query += ` WHERE store_id = '${req.user.storeId}'`; // Assuming storeId is in JWT
    }

    const result = await pool.request().query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
