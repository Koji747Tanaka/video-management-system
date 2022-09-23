const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

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

app.post("/register", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.send("congrats! new user is added.")
        }
    });
})

app.listen(3000, function () {
    console.log(`Server is running on port ${PORT}`);
});
