const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('store_owner'));

// Get store dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get store for this owner
    const [stores] = await db.query(
      'SELECT id FROM stores WHERE owner_id = ?',
      [req.user.id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const storeId = stores[0].id;

    // Get average rating
    const [ratingData] = await db.query(
      'SELECT COALESCE(AVG(rating), 0) as averageRating, COUNT(*) as totalRatings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    // Get users who rated
    const [raters] = await db.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json({
      averageRating: ratingData[0].averageRating,
      totalRatings: ratingData[0].totalRatings,
      raters
    });
  } catch (error) {
    console.error('Store dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;