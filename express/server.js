require('dotenv').config();
const { saveFile, generateUniqueName } = require('./helpers/fileHandler');
const { processVideo, takeScreenshot } = require('./helpers/ffmpegHandler');
const express = require("express");
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp')
var scopackager = require('simple-scorm-packager');
var flash = require('connect-flash');
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const expiresIn = '180min'
const ffmpeg = require('./ffmpeg');
const PORT = 3001;
const app = express();
const videoUrl = process.env.SERVER_HOST + "/transcoded/"


let dirReceived = './received';
let dirTranscoded = './public/transcoded';
let dirThumbnails = './public/thumbnails'
const mkNonDir = (dir) => {
    if (!fs.existsSync(dir)) {
        mkdirp(dir).then(made =>
            console.log(`made directories, starting with ${made}`)
        )
    }
}
mkNonDir(dirReceived)
mkNonDir(dirTranscoded)
mkNonDir(dirThumbnails)


const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.CLIENT_HOST,
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.io = io;

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_HOST })); 
app.use(express.static(__dirname + '/public'));

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
    videoName: String,
    uniqueName: String
});

const Video = new mongoose.model("Video", videoSchema);


// Create a token from a payload { id: userID, name: userName }
function createToken(id, name) {
    return jwt.sign({ id: id, name: name }, SECRET_KEY, { expiresIn })
}

function verifyToken(token) {
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        return decoded;
    })
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.get('/login', async (req, res) => {
    const jwt = req.cookies.JWTcookie;
    const {user_id, username} = await validateUser(jwt)
    if (user_id){
        const responseJson = {
            userID: user_id,
            username: username,
        }
        res.status(200).json(responseJson)
    }else{
        res.status(400).json({status: false})
    }
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
                    const userID = foundUser.id
                    const accessToken = createToken(userID, userName)
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

const validateUser = async (JWT) => {
try {
    const decoded = jwt.verify(JWT, SECRET_KEY);
    const userID = decoded.id;

    const foundUser = await User.findOne({ id: userID }).exec();

    if (foundUser) {
    const username = foundUser.username
    const user_id = foundUser.id
    return {user_id, username}
    } else {
    return false;
    }
    } catch (err) {
        console.log("Unauthorized");
        return false;
    }
};



app.get("/logout", function (req, res) {
    res.cookie('JWTcookie', "deleted", { maxAge: 0, httpOnly: true });
    res.send("logged out")
})

app.post("/register", (req, res) => {
    console.log("working")
    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((error, user) => {
        if (error) {
            if (error.code === 11000) {
                return res.json({ status: 'error', error: 'Username already in use.' });
            }
            throw error;
        } else {
            const accessToken = createToken(user.id, user.username);
            const responseJson = {
                success: true,
                username: user.username,
                userid: user.username
            }
            res.cookie('JWTcookie', accessToken, { httpOnly: true })
            res.status(200).json(responseJson)
        }
    });
})
let receivedName = "";



app.post("/convert", fileUpload({ createParentPath: true }), async function (req, res) {
    const jwt = req.cookies.JWTcookie;
    const {user_id, username} = await validateUser(jwt)
    if (!user_id){
        res.send({ success: false })
        return
    }

    receivedName = Object.keys(req.files)[0];
    const {uniqueName} = generateUniqueName(receivedName)
    const receivedFile = req.files[receivedName];
    const filePath = `./received/${receivedName}`;
    await saveFile(filePath, receivedFile["data"]);
    transcodedSegFolder = `./public/transcoded/${uniqueName}`;
    mkNonDir(transcodedSegFolder);
    const ffmpegFilePath = `./received/${receivedName}`
    const thumbnailOutputFolder = './public/thumbnails'
    const ffmpegOutputPath = `${transcodedSegFolder}/${uniqueName}.m3u8`;

    try{
        await takeScreenshot(ffmpegFilePath, thumbnailOutputFolder, uniqueName)
        await processVideo(ffmpegFilePath, ffmpegOutputPath, req.app.io, uniqueName);  
            
        const newVideo = new Video({
            userid: user_id,
            videoName: receivedName.split('.')[0],
            uniqueName: uniqueName
        });
        await newVideo.save();
        res.send({ success: true})

    }
    catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
})

app.get("/videoThumbnails", function (req, res) {
    let usersFiles = [];
    let usersVideoNames = [];


    Video.find({ userid: req.query.userID }, function (err, foundVideoArray) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundVideoArray) {
                var files = fs.readdirSync('./public/thumbnails');
                foundVideoArray.forEach(video => {
                    var foundFile = files.find(file => {
                        if (file.substring(0, file.indexOf(".")) == video.uniqueName) {
                            return file;
                        }
                        else {
                            return 0;
                        }
                    })
                    if (foundFile) {
                        const thumbURLStem = process.env.SERVER_HOST  + "/thumbnails/";
                        const videoURLStem = process.env.SERVER_HOST  + "/transcoded/";
                        const nameWithoutEx = foundFile.substring(0, foundFile.indexOf("."));

                        var object = {
                            thumbUrl: thumbURLStem + foundFile,
                            videoUrl: videoURLStem + nameWithoutEx + "/" + nameWithoutEx + ".m3u8",
                            videoName: video.videoName,
                            uniqueName: nameWithoutEx,
                        }
                        usersFiles.push(object);
                    }
                })
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

//SCORMパッケージのプロパティを設定
app.post("/scorm", function (req, res) {
    let sourceFolderName = req.body.sourceFolderName;

    let sourcePath = "./public/transcoded/" + sourceFolderName
    console.log("asdf", sourceFolderName)

    scopackager({
        version: '2004 4th Edition',
        organization: 'Chiba University',
        title: sourceFolderName,
        language: 'fr-FR',
        identifier: '00',
        masteryScore: 80,
        startingPage: 'index.html',
        source: sourcePath,
        package: {
            name: sourceFolderName,
            zip: true,
            outputFolder: './scormPackages'
        }
    }, function (msg) {
        console.log(msg);


        let version = "v1.0.0"; 
        let date = new Date().toISOString().split('T')[0]; 

        // Construct the expected filename
        const expectedFileName = sourceFolderName + "_" + version + "_" + date + ".zip";
        const pathToZip = "./scormPackages/" + expectedFileName;
        res.download(pathToZip, sourceFolderName + ".zip");
    });
});

// app.listen(PORT, () => {
//     console.log(`Express app listening on port ${PORT}.`)
// })

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

