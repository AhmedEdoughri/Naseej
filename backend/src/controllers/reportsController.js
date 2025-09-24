const { poolPromise, sql } = require("../config/db");

// @desc    Get Pickup Requests Report
// @route   GET /api/reports/pickup-requests
// @access  Admin & Manager
exports.getPickupRequestsReport = async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT
        pr.id,
        s.name as storeName,
        u.name as requestedBy,
        pr.requested_at,
        pr.pickup_date,
        pr.status,
        COUNT(i.id) as itemCount
      FROM pickup_requests pr
      JOIN stores s ON pr.store_id = s.id
      JOIN users u ON pr.requested_by_user_id = u.id
      LEFT JOIN hwali_items i ON pr.id = i.pickup_request_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (startDate) {
      query += " AND pr.requested_at >= @startDate";
      request.input("startDate", sql.Date, startDate);
    }

    if (endDate) {
      query += " AND pr.requested_at <= @endDate";
      request.input("endDate", sql.Date, endDate);
    }

    if (storeId) {
      query += " AND pr.store_id = @storeId";
      request.input("storeId", sql.UniqueIdentifier, storeId);
    }

    query += `
      GROUP BY pr.id, s.name, u.name, pr.requested_at, pr.pickup_date, pr.status
      ORDER BY pr.requested_at DESC
    `;

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("GET PICKUP REQUESTS REPORT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
