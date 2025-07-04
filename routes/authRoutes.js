const express = require('express');
const { signUp, login, Verify } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/middleware');
const router = express.Router();

// Routes
router.post('/signup', signUp);         
router.post('/login', login); 
router.get('/verify', authenticateToken,Verify);         



module.exports = router;
