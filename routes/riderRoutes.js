const express = require('express');
const { authenticateToken } = require('../middleware/middleware');
const { availableRiders, updateRiderAvailability } = require('../controllers/riderController');

const router = express.Router();

// Routes
router.get('/available', authenticateToken, availableRiders);                  
router.patch("/availability",authenticateToken,updateRiderAvailability)

         



module.exports = router;
