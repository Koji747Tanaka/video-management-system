require('dotenv').config();
const express = require("express");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
////////////////////////////////
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



//////////////////////

var fs = require('fs');
var dirReceived = './received';
var dirTranscoded = './transcoded';

const mkNonDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
mkNonDir(dirReceived);
mkNonDir(dirTranscoded);

const ffmpeg = require('./ffmpeg');

const PORT = 3000;
const app = express();

//////////////////////////////////////
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))
app.use(passport.authenticate('session'));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors(corsOptions));

var whitelist = ['http://localhost:5173', 'http://localhost:15173']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}

// mongoose.connect("mongodb://root:password@mongo:27017", {
mongoose.connect("mongodb://mongodb:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: "root",
    pass: "password",
    dbName: "videoUserDB",
});

const userSchema = new mongoose.Schema({
    // username: String,
    // password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

///////////////////////////////
passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

////////////////////////////

app.get("/register", (req, res) => {
});
app.get("/login", function (req, res) {
});
app.get("/convert", function (req, res) {
})

app.post("/register", (req, res) => {
    console.log("req body username is : " + req.body.username);
    console.log("req body password is : " + req.body.password);

    User.register({ username: req.body.username }, req.body.password, function (err, user) {

        if (err) {
            console.log("Error in User registration", err);
        } else {
            passport.authenticate("local")(req, res, function () {
                let resUser = {
                    validation: true,
                }
                res.send(resUser);
            })
        }
    })
    // const newUser = new User({
    //     username: req.body.username,
    //     password: md5(req.body.password)
    // });
    // newUser.save((error) => {
    //     if (error) {
    //         if (error.code === 11000) {
    //             //Duplicate key
    //             return res.json({ status: 'error', error: 'Username already in use.' });
    //         }
    //         throw error;
    //     } else {
    //         res.send("congrats! new user is added.")
    //     }
    // });
})
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.user,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function (err) {
                let resUser = {
                    validation: true,
                }
                res.send(resUser);
                if (err) {
                    console.log("not login ")
                }
                // res.send("login authenticated")
            }
            );
        }
    })

    // const userName = req.body.username;
    // const password = md5(req.body.password);

    // User.findOne({ username: userName }, function (err, foundUser) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         if (foundUser) {
    //             if (foundUser.password === password) {
    //                 const user = { name: foundUser.username }
    //                 const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

    // let resUser = {
    //     validation: true,
    //     _id: foundUser._id,
    //     userName: foundUser.username,
    //     token: accessToken
    // }

    // res.send(resUser);
    //             }
    //         }
    //         else {
    //             let resUser = {
    //                 validation: false
    //             }
    //             res.send(resUser);
    //         }
    //     }
    // });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = decoded
        next();
    })
}

app.get('/posts', authenticateToken, (req, res) => {
    console.log(req.user.name);

    User.findOne({ username: req.user.name }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                let resUser = {
                    validation: true,
                    _id: foundUser._id,
                    userName: foundUser.username,
                }
                console.log("congrats!!")
                res.send("you are logged in.")
            }
            else {
                let resUser = {
                    validation: false
                }
                res.send("you are rejected")
            }
        }
    });

});




app.post("/convert", fileUpload({ createParentPath: true }), function (req, res) {
    const receivedName = Object.keys(req.files)[0];
    const receivedFile = req.files[receivedName];

    fs.writeFile(`./received/${receivedName}`, receivedFile["data"], function (err) {
        if (err) {
            return console.log("Err in write file ", err);
        }
        console.log("The file was saved!");
    });

    ffmpeg(`./received/${receivedName}`)
        .videoCodec('libx264')
        .audioCodec('libmp3lame')
        .size('320x?')
        .on('error', function (err) {
            console.log("Err happened", err)
        })
        .on('end', function () {
            console.log('Process finished.')
        })
        .save(`./transcoded/${receivedName}`)
})

app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
