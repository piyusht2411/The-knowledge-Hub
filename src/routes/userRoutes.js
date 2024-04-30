const express = require('express');
const router = express.Router();
const {register,login} = require('../controllers/userController');
const authUser = require('../middleware/authUser');

router.post('/register',register );
router.post('/login', login)
router.get("/check", authUser, (req,res)=>{
    res.json({
        message: "You are authenticated"
    })
})

module.exports = router;
