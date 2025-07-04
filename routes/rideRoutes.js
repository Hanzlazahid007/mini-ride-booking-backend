const express = require('express');
// const { authenticateToken } = require('../middleware/middleware');
const { bookSpecificRide, rideHistoryPassenger, currentRidePassenger, availableRideForRider, myRides, updateRideStatus } = require('../controllers/rideController');
const { authenticateToken } = require('../middleware/middleware');


const router = express.Router();

// Routes
router.post('/book', authenticateToken, bookSpecificRide);                  
router.get("/history",authenticateToken,rideHistoryPassenger)
router.get("/current",authenticateToken,currentRidePassenger)
router.get("/available",authenticateToken,availableRideForRider)
router.get("/my-rides",authenticateToken,myRides)


router.patch("/:rideId/status",authenticateToken,updateRideStatus)



         



module.exports = router;
