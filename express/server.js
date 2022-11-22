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
var scopackager = require('simple-scorm-packager');


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
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
//////////////////////////////////////
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

// app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

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
passport.serializeUser(function (user, done) {
    console.log("user id is here ", user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log("deserialise working");
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


////////////////////////////

app.get("/register", (req, res) => {
});
app.get("/login", function (req, res) {
});
app.get("/convert", function (req, res) {
})

app.get("/logout", function (req, res) {
    console.log("req in serialise ", req.cookies.session);
    req.logout(function (err) {
        console.log("log out ", req.cookies);
        if (err) { return next(err); } else {
            res.send(true)
        }
    });
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
                // res.send("login authenticated")
            }
            );
        }
    })
});


app.post("/convert", fileUpload({ createParentPath: true }), function (req, res) {
    const receivedName = Object.keys(req.files)[0];
    const noExName = receivedName.substring(0, receivedName.indexOf("."));

    const receivedFile = req.files[receivedName];
    var transcodedSeg = `./transcoded/${noExName}`;
    mkNonDir(transcodedSeg);
    console.log({ transcodedSeg });

    fs.writeFile(`./received/${receivedName}`, receivedFile["data"], function (err) {
        if (err) {
            return console.log("Err in write file ", err);
        }
        console.log("The file was saved!", receivedName);
    });

    ffmpeg(`./received/${receivedName}`)
        .audioCodec('libopus')
        .audioBitrate(96)
        .output(`${transcodedSeg}/${receivedName}.m3u8`)
        .run()

    ///Scorm package は別でダウンロード
    scopackager({
        version: '2004 4th Edition',
        organization: 'Chiba University',
        title: `${noExName}`,
        language: 'fr-FR',
        identifier: '00',
        masteryScore: 80,
        startingPage: 'index.html',
        source: `${transcodedSeg}`,
        package: {
            version: "0.0.1",
            zip: true,
            outputFolder: './scormPackages'
        }
    }, function (msg) {
        console.log(msg);
    });

    // .save(`./transcoded/${receivedName}`)


})

app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
