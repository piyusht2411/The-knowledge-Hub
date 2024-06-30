const express = require('express');
const router = express.Router();
const { register,login, otpVerification, forgotPassword, changePassword, editProfile } = require('../controllers/userController');
const authUser = require('../middleware/authUser');

router.post('/register',register );
router.post('/otp-verification', otpVerification)
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/change-password', authUser, changePassword);
router.get('/edit-profile', authUser, editProfile)
router.get("/check", authUser, (req,res)=>{
    res.json({
        message: "You are authenticated"
    })
})

module.exports = router;
