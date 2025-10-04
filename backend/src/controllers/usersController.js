const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/db");

// @desc    Get all users (for the admin panel)
// @route   GET /api/users
// @access  Admin only
exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.id, u.name, u.email, u.status, u.role_id, r.name as roleName, u.phone, u.notes, u.user_id
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Approve a pending user
// @route   PATCH /api/users/:id/approve
// @access  Admin only
exports.approveUser = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query(
        "UPDATE users SET status = 'active' WHERE id = @id AND status = 'pending'"
      );

    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("APPROVE USER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Deny and delete a pending registration
// @route   DELETE /api/users/:id/deny
// @access  Admin only
exports.denyRegistration = async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // First, get the user and their associated store_id
    const userResult = await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query(
        "SELECT store_id FROM users WHERE id = @id AND status = 'pending'"
      );

    if (userResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: "Pending user not found." });
    }

    const { store_id } = userResult.recordset[0];

    // Delete the user
    await new sql.Request(transaction)
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM users WHERE id = @id");

    // If there's an associated store, delete it
    if (store_id) {
      await new sql.Request(transaction)
        .input("store_id", sql.UniqueIdentifier, store_id)
        .query("DELETE FROM stores WHERE id = @store_id");
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: "Registration denied and user deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("DENY REGISTRATION ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a new user (for the admin panel)
// @route   POST /api/users
// @access  Admin only
exports.createUser = async (req, res) => {
  const { name, email, password, role_id, phone, notes } = req.body;

  if (!name || !email || !password || !role_id || !phone) {
    return res.status(400).json({
      message: "Name, email, password, phone, and role are required.",
    });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const pool = await poolPromise;
    await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.Text, password_hash)
      .input("role_id", sql.Int, role_id)
      .input("phone", sql.VarChar, phone)
      .input("notes", sql.Text, notes) // new
      .query(
        "INSERT INTO users (name, email, password_hash, role_id, phone, notes, status) VALUES (@name, @email, @password_hash, @role_id, @phone, @notes, 'active')"
      );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle specific SQL error for duplicate email
    if (error.number === 2627) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a user (for the admin panel)
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM users WHERE id = @id");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Admin only
exports.updateUser = async (req, res) => {
  const { name, email, role_id, status, password, phone, notes } = req.body;

  try {
    let password_hash;
    // If a new password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    const pool = await poolPromise;
    const request = pool
      .request()
      .input("id", sql.UniqueIdentifier, req.params.id);

    let query =
      "UPDATE users SET name = @name, email = @email, role_id = @role_id, status = @status, phone = @phone, notes = @notes";
    request.input("name", sql.VarChar, name);
    request.input("email", sql.VarChar, email);
    request.input("role_id", sql.Int, role_id);
    request.input("status", sql.VarChar, status);
    request.input("phone", sql.VarChar, phone);
    request.input("notes", sql.Text, notes);

    if (password_hash) {
      query += ", password_hash = @password_hash";
      request.input("password_hash", sql.Text, password_hash);
    }

    query += " WHERE id = @id";

    await request.query(query);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all available roles for the dropdown menu
// @route   GET /api/users/roles
// @access  Admin only
exports.getRoles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, name FROM roles");
    res.json(result.recordset);
  } catch (error) {
    console.error("GET ROLES ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a new customer (user and store)
// @route   POST /api/users/customer
exports.createCustomer = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    storeName,
    address, // Now correctly receives address
    city, // Now correctly receives city
    notes,
  } = req.body;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const existingUser = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");
    if (existingUser.recordset.length > 0) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    await transaction.begin();

    // 1. Create the User
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const roleResult = await new sql.Request(transaction).query(
      "SELECT id FROM roles WHERE name = 'customer'"
    );
    const customerRoleId = roleResult.recordset[0].id;

    const userResult = await new sql.Request(transaction)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.Text, password_hash)
      .input("role_id", sql.Int, customerRoleId)
      .input("phone", sql.VarChar, phone)
      .query(
        "INSERT INTO users (name, email, password_hash, role_id, phone, status) OUTPUT INSERTED.id VALUES (@name, @email, @password_hash, @role_id, @phone, 'active')"
      );

    const newUserId = userResult.recordset[0].id;

    // 2. Create the Store, now including address and city
    await new sql.Request(transaction)
      .input("name", sql.VarChar, storeName)
      .input("address", sql.Text, address) // Correctly uses address
      .input("city", sql.VarChar, city) // Correctly uses city
      .input("notes", sql.Text, notes)
      .input("user_id", sql.UniqueIdentifier, newUserId)
      .query(
        "INSERT INTO stores (name, address, city, notes, user_id) VALUES (@name, @address, @city, @notes, @user_id)"
      );

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Customer and store created successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("CREATE CUSTOMER ERROR:", error);
    res.status(500).json({ message: "Server error during customer creation." });
  }
};
