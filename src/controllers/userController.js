const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const User = require('../models/User');
const sendMail = require('../utils/emailer');

const register = async (req, res) => {
    try {
        const { name, email, password, color, image } = req.body;

        const expression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;

        if (!expression.test(email.toString())) {
            return res.status(407).json({ message: 'Enter valid email' });
        }
        if (!pass.test(password.toString())) {
            return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }
        const otp = authenticator.generateSecret().slice(0, 6);

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(409).json({
                    message: "User already exists"
                });
            } else {
                sendMail(email, "Email Verification", `Your email verification otp is ${otp}. Use this otp to verify your email, this will expire in 10 minutes`);

                existingUser.name = name;
                existingUser.password = password;
                existingUser.color = color;
                existingUser.image = image;
                existingUser.otp = otp;
                existingUser.otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);
                await existingUser.save();

                return res.status(200).json({ message: "Otp generated and sent successfully!" });
            }
        }

        sendMail(email, "Email Verification", `Your email verification otp is ${otp}. Use this otp to verify your email, this will be expire 10 minutes`);

        const newUser = new User({ email, password, name, otp, color, image, otpExpireAt: new Date(Date.now() + 10 * 60 * 1000) });
        await newUser.save();
        res.status(200).json({ message: "Otp generated Successfully!" });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong", error: err.message
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
        if (!user.isVerified) {
            return res.status(403).json({ message: "User not verified!" })
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

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(409).json({ message: "User doesn't exist" });
        }

        const otp = authenticator.generateSecret().slice(0, 6);
        sendMail(email, "Forgot Password", `Your forgot password otp is ${otp}. Use this otp to reset your password, this will expire in 10 minutes`);

        user.otp = otp;
        user.otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        res.status(200).json({ message: "Otp sent successfully" });

    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(409).json({ message: 'Invalid current password' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const editProfile = async (req, res) => {
    try {
        const { name, image } = req.body;
        const userId = req.userId;
        const user = await User.findByIdAndUpdate(userId, { name, image }, { new: true });
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}


module.exports = {
    register,
    login,
    otpVerification,
    forgotPassword,
    changePassword,
    editProfile
}