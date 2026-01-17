const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { userValidationRules, storeValidationRules, handleValidationErrors } = require('../middleware/validators');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.query('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Add new user
router.post('/users', userValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role || 'user']
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Add new store
router.post('/stores', storeValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, address, ownerPassword } = req.body;

    const [existingStore] = await db.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStore.length > 0) {
      return res.status(400).json({ message: 'Store email already exists' });
    }

    // Create store owner user
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'store_owner']
    );

    // Create store
    const [storeResult] = await db.query(
      'INSERT INTO stores (owner_id, name, email, address) VALUES (?, ?, ?, ?)',
      [userResult.insertId, name, email, address]
    );

    res.status(201).json({ 
      message: 'Store created successfully',
      storeId: storeResult.insertId 
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Error creating store' });
  }
});

// Get all stores with filters and sorting
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.*, 
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as ratingCount
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';
    
    const validSortColumns = ['name', 'email', 'address', 'rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Error fetching stores' });
  }
});

// Get all users with filters and sorting
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role,
        CASE 
          WHEN u.role = 'store_owner' THEN (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.owner_id = u.id
          )
          ELSE NULL
        END as rating
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    const validSortColumns = ['name', 'email', 'address', 'role'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.address, u.role,
        CASE 
          WHEN u.role = 'store_owner' THEN (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.owner_id = u.id
          )
          ELSE NULL
        END as rating
      FROM users u
      WHERE u.id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

module.exports = router;