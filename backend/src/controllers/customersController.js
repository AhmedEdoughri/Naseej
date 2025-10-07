const { poolPromise, sql } = require("../config/db");

// @desc    Get all customers
// @route   GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM customers ORDER BY name");
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
exports.createCustomer = async (req, res) => {
  const { name, phone, notes } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("phone", sql.VarChar, phone)
      .input("city", sql.VarChar, city)
      .input("notes", sql.Text, notes)
      .query(
        "INSERT INTO customers (name, phone, city, notes) OUTPUT INSERTED.* VALUES (@name, @phone, @city, @notes)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  const { name, phone, notes } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .input("name", sql.VarChar, name)
      .input("phone", sql.VarChar, phone)
      .input("city", sql.VarChar, city)
      .input("notes", sql.Text, notes)
      .query(
        "UPDATE customers SET name = @name, phone = @phone, city = @city, notes = @notes WHERE id = @id"
      );
    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a store and its associated user
// @route   DELETE /api/stores/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool

      .request()

      .input("id", sql.UniqueIdentifier, req.params.id)

      .query("DELETE FROM customers WHERE id = @id");

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
