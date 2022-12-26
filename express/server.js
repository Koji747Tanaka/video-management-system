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
const ffmpeg = require('./ffmpeg');
const shortid = require('shortid');
const { uploadFile } = require('./s3')

//自己発行証明書
var privateKey = fs.readFileSync(__dirname + '/cert/localhost-key.pem');
var certificate = fs.readFileSync(__dirname + '/cert/localhost.pem');
var options = {
    key: privateKey,
    cert: certificate
};

const PORT = 3000;
const app = express();
var scormName = "";
var sourceFolder = "";

var sourcePath = "";

var transcodedSeg = ""

//ディレクトリーの作成
var dirReceived = './received';
var dirTranscoded = './public/transcoded';
const mkNonDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
mkNonDir(dirReceived);
mkNonDir(dirTranscoded);


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: 'https://localhost:15173' }));
app.use(express.static(__dirname + '/public'));

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

const videoSchema = new mongoose.Schema({
    userid: String,
    videoname: String,
});

const Video = new mongoose.model("Video", videoSchema);

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



//セグメント
app.post("/convert", fileUpload({ createParentPath: true }), function (req, res) {
    const receivedName = Object.keys(req.files)[0];
    console.log(req.files);
    const noExName = receivedName.substring(0, receivedName.indexOf("."));
    const radom = shortid.generate();
    const dirName = noExName + radom;

    console.log("NO extention name is here", dirName)
    const receivedFile = req.files[receivedName];
    transcodedSegFolder = `./public/transcoded/${dirName}`;
    console.log("transcoded segment file folder is here", transcodedSegFolder);
    mkNonDir(transcodedSegFolder);
    console.log({ transcodedSegFolder });

    fs.writeFile(`./received/${receivedName}`, receivedFile["data"], function (err) {
        if (err) {
            return console.log("Err in write file ", err);
        }
        console.log("The file was saved!", receivedName);
    });


    //サムネイル画像作成
    ffmpeg(`./received/${receivedName}`)
        .takeScreenshots(
            {
                count: 1,
                timemarks: ['00:00:01.000'],
                folder: './public/thumbnails',
                filename: dirName
            });

    //セグメントファイル化
    ffmpeg(`./received/${receivedName}`)
        .audioCodec('libmp3lame')
        .videoCodec('libx264')
        .size('320x200')
        .audioBitrate(128)
        .output(`${transcodedSegFolder}/${dirName}.m3u8`)
        .on('end', async function () {
            console.log('file has been converted succesfully')

            const filenames = fs.readdirSync(`${transcodedSegFolder}`)
            filenames.forEach(async (filename) => {
                const folderWithFile = dirName + "/" + filename
                const filePath = `${transcodedSegFolder}` + "/" + filename

                console.log("file path is here", filePath)
                console.log("folder and file here", folderWithFile)

                const result = await uploadFile(filePath, folderWithFile);
                console.log(result);
            })


            // const result = await uploadFile(`${transcodedSegFolder}/${dirName}.m3u8`, dirName);
            // console.log(result);

            res.send({ success: true, dirName: dirName, videoUrl: transcodedSegFolder });
        })
        .run();
})

app.post("/videoDatabase", function (req, res) {
    console.log(req.body.userID);
    const newVideo = new Video({
        userid: req.body.userID,
        videoname: req.body.videoName
    });
    newVideo.save((error, video) => {
        if (error) {
            if (error.code === 11000) {
                //Duplicate key
                return res.json({ status: 'error', error: 'Username already in use.' });
            }
            throw error;
        } else {
            res.send("successfully saved.");
        }
    });
});

app.get("/videoThumbnails", function (req, res) {
    console.log(req.query.userID);

    let usersFiles = [];
    let usersVideoNames = [];
    Video.find({ userid: req.query.userID }, function (err, foundVideoArray) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundVideoArray) {
                foundVideoArray.forEach(video => {
                    var files = fs.readdirSync('./public/thumbnails');
                    // console.log("files", files);
                    var foundFile = files.find(file => {
                        if (file.substring(0, file.indexOf(".")) == video.videoname) {
                            return file;
                        }
                        else {
                            return 0;
                        }
                    })
                    if (foundFile) {
                        const thumbURLStem = "https://localhost:3000/thumbnails/";
                        const videoURLStem = "https://localhost:3000/transcoded/";
                        const nameWithoutEx = foundFile.substring(0, foundFile.indexOf("."));
                        var object = {
                            thumbUrl: thumbURLStem + foundFile,
                            videoUrl: videoURLStem + nameWithoutEx + "/" + nameWithoutEx + ".m3u8",
                            videoName: nameWithoutEx
                        }

                        usersFiles.push(object);
                        // usersVideoNames.push(foundFile.substring(0, foundFile.indexOf(".")))
                    }
                })
                console.log("found video name is here", usersFiles);
                res.send({ success: true, objects: usersFiles });

            }
            else {
                const status = 401
                const message = 'Incorrect username or password'
                res.status(status).json({ status, message })
            }
        }
    });
})

//最新で作成されたファイル
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

//SCORMパッケージのプロパティを設定
app.post("/scormProperty", function (req, res) {
    scormName = req.body.scormName;
    sourceFolder = req.body.sourceFolder;

    sourcePath = "./public/transcoded/" + sourceFolder

    console.log(scormName);
    res.send({ success: true });
});

//SCORMパッケージ作成　ZIPファイル作成
app.post("/scorm", function (req, res) {
    scopackager({
        version: '2004 4th Edition',
        organization: 'Chiba University',
        title: scormName,
        language: 'fr-FR',
        identifier: '00',
        masteryScore: 80,
        startingPage: 'index.html',
        source: sourcePath,
        package: {
            name: scormName,
            zip: true,
            outputFolder: './scormPackages'
        }
    }, function (msg) {
        console.log(msg);
        const pathToZip = "./scormPackages/" + getMostRecentFile("./scormPackages").file;
        console.log("pathToZip", pathToZip);

        // const pathToZip = sourcePath;
        // console.log("pathToZip", pathToZip);
        res.download(pathToZip);
    });
})

//HTTPSプロトコルに変換
var httpsServer = https.createServer(options, app);
httpsServer.listen(3000);

