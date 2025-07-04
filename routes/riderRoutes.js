const express = require('express');
const { authenticateToken } = require('../middleware/middleware');
const { availableRiders, updateRiderAvailable,  } = require('../controllers/riderController');

const router = express.Router();

// Routes
router.get('/available', authenticateToken, availableRiders);                  
router.patch("/availability",authenticateToken,updateRiderAvailable)

         



module.exports = router;
