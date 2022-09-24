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

var whitelist = ['http://localhost:5173', 'http://localhost:5173/login']
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
    username: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/register", (req, res) => {
    res.send("Here is register page");
});

app.post("/register", (req, res) => {
    console.log("req body username is : " + req.body.username);
    console.log("req body password is : " + req.body.password);

    res.send("Express register received the request");

    // const newUser = new User({
    //     username: req.body.username,
    //     password: md5(req.body.password)
    // });
    // newUser.save((err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.send("congrats! new user is added.")
    //     }
    // });

})

app.listen(3000, function () {
    console.log(`Server is running on port ${PORT}`);
});
