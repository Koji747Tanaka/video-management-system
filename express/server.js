require('dotenv').config();
const express = require("express");
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
var fs = require('fs');
const path = require('path');
var scopackager = require('simple-scorm-packager');
var flash = require('connect-flash');
const https = require('https');
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const expiresIn = '30min'

// var privateKey = fs.readFileSync(__dirname + '/certs/selfsigned.key');
var privateKey = fs.readFileSync(__dirname + '/test/localhost-key.pem');
///Users/koji/workspace/video-management/video-management/localhost-key.pem
// var certificate = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
var certificate = fs.readFileSync(__dirname + '/test/localhost.pem');
///Users/koji/workspace/video-management/video-management/localhost.pem

var options = {
    key: privateKey,
    cert: certificate
};

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
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(cors({ credentials: true, origin: 'https://localhost:15173' }));
// app.use(cors({ credentials: true, origin: 'http://localhost:15173' }));
app.use(express.static(__dirname + '/transcoded'));

// mongoose.connect("mongodb://root:password@mongo:27017", {
mongoose.connect("mongodb://mongodb:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: "root",
    pass: "password",
    dbName: "videoUserDB",
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/register", (req, res) => {
});

// Create a token from a payload { id: userID, name: userName }
function createToken(id, name) {
    return jwt.sign({ id: id, name: name }, SECRET_KEY, { expiresIn })
}

function verifyToken(token) {
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        return decoded;
    })
}

app.post("/login", function (req, res) {
    const userName = req.body.username;
    const password = md5(req.body.password);

    // const userID = isAuthenticated(userName, password);

    User.findOne({ username: userName }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    const userID = foundUser.id
                    const accessToken = createToken(userID, userName)
                    console.log("here is token", accessToken);

                    const responseJson = {
                        success: true,
                        username: userName,
                        userID: userID
                    }

                    res.cookie('JWTcookie', accessToken, { httpOnly: true })
                    res.status(200).json(responseJson)
                }
            }
            else {
                const status = 401
                const message = 'Incorrect username or password'
                res.status(status).json({ status, message })
            }
        }
    });
});

app.get("/login", function (req, res) {
    var JWTcookie = req.cookies.JWTcookie;
    console.log("JWT cookie is here", req.cookies.JWTcookie);
    try {
        console.log("veryfy token is here", verifyToken(JWTcookie));
        const decoded = jwt.verify(JWTcookie, SECRET_KEY, function (err, decoded) {
            return decoded;
        })
        const responseJson = {
            success: true,
            username: decoded.name,
            userID: decoded.id
        }
        res.status(200).json(responseJson);
        // console.log("decoded token ", decoded);
    }
    catch (err) {
        const status = 401
        const message = 'Unauthorized'
        res.send("Not authorized. Better login");
        // res.status(status).json({ status, message })
    }
});


app.get("/convert", function (req, res) {
})

app.get("/logout", function (req, res) {
    res.cookie('JWTcookie', "deleted", { maxAge: 0, httpOnly: true });
    res.send("logged out")
})

app.post("/register", (req, res) => {
    console.log("req body username is : " + req.body.username);
    console.log("req body password is : " + req.body.password);
    const userName = req.body.username;
    // res.send("Express register received the request");

    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((error, user) => {
        if (error) {
            if (error.code === 11000) {
                //Duplicate key
                return res.json({ status: 'error', error: 'Username already in use.' });
            }
            throw error;

        } else {
            const accessToken = createToken(user.id, user.username);

            const responseJson = {
                success: true,
                username: user.username,
                userID: user.id
            }
            res.cookie('JWTcookie', accessToken, { httpOnly: true })
            res.status(200).json(responseJson)
        }
    });
})



var scormName = "";
app.post("/scormProperty", function (req, res) {
    scormName = req.body.scormName
    console.log(scormName);
    res.send({ success: true });
});

const getMostRecentFile = (dir) => {
    const files = orderReccentFiles(dir);
    return files.length ? files[0] : undefined;
};

const orderReccentFiles = (dir) => {
    return fs.readdirSync(dir)
        .filter(file => fs.lstatSync(path.join(dir, file)).isFile())
        .map(file => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

app.post("/convert", fileUpload({ createParentPath: true }), function (req, res) {
    const receivedName = Object.keys(req.files)[0];
    console.log(req.files)
    const noExName = receivedName.substring(0, receivedName.indexOf("."));
    console.log("NO extention name is here", noExName)
    const receivedFile = req.files[receivedName];
    var transcodedSeg = `./transcoded/${noExName}`;
    console.log("transcoded segment file folder is here", transcodedSeg);
    mkNonDir(transcodedSeg);
    console.log({ transcodedSeg });

    fs.writeFile(`./received/${receivedName}`, receivedFile["data"], function (err) {
        if (err) {
            return console.log("Err in write file ", err);
        }
        console.log("The file was saved!", receivedName);
    });

    ffmpeg(`./received/${receivedName}`)
        .takeScreenshots(
            {
                count: 1,
                timemarks: ['00:00:01.000'],
                // size: '200x200,
                folder: './thumbnails',
                filename: noExName
            });

    ffmpeg(`./received/${receivedName}`)
        .audioCodec('libopus')
        .audioBitrate(96)
        .output(`${transcodedSeg}/${noExName}.m3u8`)
        .run()
    // .save(`./transcoded/${receivedName}`)
})

app.get("/video", function (req, res) {
    res.send(__dirname + "/transcoded/yayoi/yayoi.m3u8");
})

app.post("/scorm", function (req, res) {
    ///Scorm package は別でダウンロード
    scopackager({
        version: '2004 4th Edition',
        organization: 'Chiba University',
        title: scormName,
        language: 'fr-FR',
        identifier: '00',
        masteryScore: 80,
        startingPage: 'index.html',
        source: `${transcodedSeg}`,
        package: {
            name: scormName,
            zip: true,
            outputFolder: './scormPackages'
        }
    }, function (msg) {
        console.log(msg);
        const pathToZip = "./scormPackages/" + getMostRecentFile("./scormPackages").file;
        console.log("pathToZip", pathToZip);
        res.download(pathToZip);
    });
})

// app.listen(PORT, function () {
//     console.log(`Server is running on port ${PORT}`);
// });

var httpsServer = https.createServer(options, app);
httpsServer.listen(3000);

