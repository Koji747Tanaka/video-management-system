const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const cors = require("cors");

const PORT = 3000;
const app = express();

app.use(bodyParser.json());
// app.use(express.json());// body-parser settings
app.use(bodyParser.urlencoded({
    extended: true
}));


// app.use(express.static("public"));

app.use(cors(corsOptions));

var whitelist = ['http://localhost:5173', 'http://localhost:15173']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.get("/", (req, res) => {
    res.send("Here is express");
})

mongoose.connect("mongodb://localhost:27017/videoUserDB", {
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = new mongoose.model("User", userSchema);

app.get("/register", (req, res) => {
    res.send("Here is register page");
});

app.get("/login", function (req, res) {
    res.send("Here is login page");
});

app.post("/register", async (req, res) => {
    console.log("req body username is : " + req.body.username);
    console.log("req body password is : " + req.body.password);

    // res.send("Express register received the request");

    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((error) => {
        if (error) {
            if (error.code === 11000) {
                //Duplicate key
                return res.json({ status: 'error', error: 'Username already in use.' });
            }
            throw error;

        } else {
            res.send("congrats! new user is added.")
        }
    });


    // res.json({ status: 'ok' });
})

app.post("/login", function (req, res) {
    const userName = req.body.username;
    const password = md5(req.body.password);

    User.findOne({ username: userName }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.send("Matched");
                }
            }
            else {
                res.send("Not Matched");
            }
        }
    });
});

app.listen(3000, function () {
    console.log(`Server is running on port ${PORT}`);
});
