const { poolPromise, sql } = require("../config/db");

// @desc    Get all system settings
// @route   GET /api/settings
// @access  Admin, Manager
exports.getSettings = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM system_settings");

    // Convert array of objects to a single key-value object for easier use on the frontend
    const settings = result.recordset.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    res.status(200).json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Admin only
exports.updateSettings = async (req, res) => {
  const settingsToUpdate = req.body; // Expects an object like { pickup_price: '60.00' }
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Loop through the provided settings and update them in the database
    for (const key in settingsToUpdate) {
      if (Object.hasOwnProperty.call(settingsToUpdate, key)) {
        const value = settingsToUpdate[key];
        const request = new sql.Request(transaction);
        // Use MERGE to either UPDATE the existing setting or INSERT it if it's new
        await request
          .input("key", sql.VarChar, key)
          .input("value", sql.NVarChar, value).query(`
            MERGE system_settings AS target
            USING (SELECT @key AS setting_key) AS source
            ON (target.setting_key = source.setting_key)
            WHEN MATCHED THEN
                UPDATE SET setting_value = @value
            WHEN NOT MATCHED THEN
                INSERT (setting_key, setting_value) VALUES (@key, @value);
          `);
      }
    }

    await transaction.commit();
    res.status(200).json({ message: "Settings updated successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Server error while updating settings." });
  }
};
