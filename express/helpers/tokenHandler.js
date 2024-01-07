require('dotenv').config();
const User = require('./mongodb/user');
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const expiresIn = '180min'

const validateUser = async (JWT) => {
    try {
        const decoded = jwt.verify(JWT, SECRET_KEY);
        const userID = decoded.id;
        const foundUser = await User.findOne({ id: userID });
        if (foundUser) {
            const username = foundUser.username
            const user_id = foundUser.id
            return { user_id, username }
        } else {
            return false;
        }
    } 
    catch (err) {
        console.log("Unauthorized");
        return false;
    }
};

const generateAccessToken = (id, name) => {
    return jwt.sign({ id: id, name: name }, SECRET_KEY, { expiresIn })
}

module.exports = {validateUser, generateAccessToken}

