const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingValidationRules, passwordUpdateRules, handleValidationErrors } = require('../middleware/validators');

router.use(authenticateToken);

// Update password
router.put('/password', passwordUpdateRules, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Get all stores (for normal users)
router.get('/stores', authorizeRoles('user'), async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.address, s.email,
        COALESCE(AVG(r.rating), 0) as overallRating,
        COUNT(DISTINCT r.id) as totalRatings,
        ur.rating as userRating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id, ur.rating';
    
    const validSortColumns = ['name', 'address', 'overallRating'];
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

// Submit or update rating
router.post('/ratings', authorizeRoles('user'), ratingValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    // Check if store exists
    const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Insert or update rating
    await db.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, storeId, rating]
    );

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

module.exports = router;