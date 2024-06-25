const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const User = require('../models/User');
const sendMail  = require('../utils/emailer');

const register = async (req, res) => {
    try {
        const { username, email, password, color } = req.body;

        const expression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;

        // check input for validation
        if (!expression.test(email.toString())) {
            return res.status(407).json({ message: 'Enter valid email' });
        }
        if (!pass.test(password.toString())) {
            return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }

        const existinguser = await User.findOne({ email: email })
        if (existinguser) {
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const otp = authenticator.generateSecret().slice(0, 6);

        sendMail(email, "Email Verification", `Your email verification otp is ${otp}. Use this otp to verify your email, this will be expire 10 minutes`);

        const newUser = new User({ email, password, username, otp, color, otpExpireAt: new Date(Date.now() + 10 * 60 * 1000) });
        await newUser.save();
        res.status(200).json({ message: "Otp generated Successfully!" });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

const otpVerification = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({
                message: "User doesn't exist"
            })
        }
        const isMatch = await bcrypt.compare(otp, user.otp);

        if (!isMatch) {
            return res.status(409).json({
                message: "Invalid otp"
            })
        }
        if (user.otpExpireAt < new Date()) {
            return res.status(409).json({
                message: "Otp Expired"
            })
        }
        user.otp = null;
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "User Registered Successfully!" });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(409).json({
                message: "User doesn't exist"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(409).json({
                message: "Invalid credentials"
            })
        }

        const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY || " ", { expiresIn: '30m' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET_KEY || " ", { expiresIn: '2h' });


        res.cookie('authToken', authToken, ({ httpOnly: true }));
        res.cookie('refreshToken', refreshToken, ({ httpOnly: true }));
        res.header('Authorization', `Bearer ${authToken}`);

        res.status(200).json({ ok: true, message: "User login successfully", userId: user.id, userEmail: user.email, authToken: authToken });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = {
    register,
    login,
    otpVerification
}