const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        const user = new User({ username, email, password, color});
        await user.save();
        res.status(200).json({ message: "User register successfully" });
    } catch (err) {
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
    login
}