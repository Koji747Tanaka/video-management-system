require('dotenv').config();
const { saveFile, generateUniqueName } = require('./helpers/fileHandler');
const { processVideo, takeScreenshot } = require('./helpers/ffmpegHandler');
const { validateUser, generateAccessToken } = require('./helpers/tokenHandler');
const { findThumbnailFile, createResponseObject } = require('./helpers/videoHandler');
const packageScorm = require('./helpers/scormHandler');
const express = require("express");
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const md5 = require("md5");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp')
const PORT = 3001;
const app = express();
const connectDB = require('./helpers/mongodb/database');

// Connect to MongoDB
connectDB();

// Import models
const User = require('./helpers/mongodb/user');
const Video = require('./helpers/mongodb/video');

const mkNonDir = (dir) => {
    if (!fs.existsSync(dir)) {
        mkdirp(dir).then(made =>
            console.log(`made directories, starting with ${made}`)
        )
    }
}
const directories = ['./received', './public/transcoded', './public/thumbnails'];
directories.forEach(mkNonDir);


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
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_HOST }));
app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.get('/login', async (req, res) => {
    const jwt = req.cookies.JWTcookie;
    const { user_id, username } = await validateUser(jwt)
    if (user_id) {
        const responseJson = {
            userID: user_id,
            username: username,
        }
        res.status(200).json(responseJson)
    } else {
        res.status(400).json({ status: false })
    }
})

const isPasswordValid = (user, password) => {
    return user && user.password === password;
}

app.post("/login", function (req, res) {
    const userName = req.body.username;
    const password = md5(req.body.password);

    User.findOne({ username: userName }, function (err, foundUser) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (!foundUser) {
            return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }

        if (!isPasswordValid(foundUser, password)) {
            return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }

        const accessToken = generateAccessToken(foundUser.id, userName);
        res.cookie('JWTcookie', accessToken, { httpOnly: true });
        res.status(200).json({
            success: true,
            username: userName,
            userID: foundUser.id
        });
    });
});



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

app.post("/convert", fileUpload({ createParentPath: true }), async function (req, res) {
    const jwt = req.cookies.JWTcookie;
    const { user_id, username } = await validateUser(jwt)
    if (!user_id) {
        res.send({ success: false })
        return
    }

    const receivedName = Object.keys(req.files)[0];
    const { uniqueName } = generateUniqueName(receivedName)
    const receivedFile = req.files[receivedName];
    const filePath = `./received/${receivedName}`;
    await saveFile(filePath, receivedFile["data"]);
    transcodedSegFolder = `./public/transcoded/${uniqueName}`;
    mkNonDir(transcodedSegFolder);
    const ffmpegFilePath = `./received/${receivedName}`
    const thumbnailOutputFolder = './public/thumbnails'
    const ffmpegOutputPath = `${transcodedSegFolder}/${uniqueName}.m3u8`;

    try {
        await takeScreenshot(ffmpegFilePath, thumbnailOutputFolder, uniqueName)
        await processVideo(ffmpegFilePath, ffmpegOutputPath, req.app.io, uniqueName);

        const newVideo = new Video({
            userid: user_id,
            videoName: receivedName.split('.')[0],
            uniqueName: uniqueName
        });
        await newVideo.save();
        res.send({ success: true })

    }
    catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
})


app.get("/videoThumbnails", function (req, res) {
    Video.find({ userid: req.query.userID }, function (err, foundVideoArray) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (!foundVideoArray || foundVideoArray.length === 0) {
            return res.status(404).json({ success: false, message: 'No videos found' });
        }

        const files = fs.readdirSync('./public/thumbnails');
        const usersFiles = foundVideoArray.map(video => {
            const foundFile = findThumbnailFile(files, video.uniqueName);
            return foundFile ? createResponseObject(foundFile, video) : null;
        }).filter(obj => obj != null);

        res.json({ success: true, objects: usersFiles });
    });
});

app.post("/scorm", function (req, res) {
    const sourceFolderName = req.body.sourceFolderName;

    packageScorm(sourceFolderName, (msg) => {
        console.log(msg);
        const version = "v1.0.0";
        const date = new Date().toISOString().split('T')[0];
        const expectedFileName = `${sourceFolderName}_${version}_${date}.zip`;
        const pathToZip = `./scormPackages/${expectedFileName}`;
        res.download(pathToZip, `${sourceFolderName}.zip`);
    });
});

app.delete("/delete", function (req, res) {

    const videoName = req.body.videoName
    const thumbnailsDirectoryPath = './public/thumbnails';
    const transcodedDirectoryPath = './public/transcoded';
    const scormDirectoryPath = './scormPackages';
    const targetThumbnailsPath = path.join(thumbnailsDirectoryPath, `${videoName}.png`);
    try {


        fs.unlink(targetThumbnailsPath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
        fs.readdir(scormDirectoryPath, (err, files) => {
            if (err) {
                console.error('Error reading the directory', err);
                return;
            }
            // Filter and delete files that start with 'abc' and end with '.png'
            files.forEach(file => {
                if (file.startsWith(videoName)) {
                    fs.unlink(path.join(scormDirectoryPath, file), err => {
                        if (err) {
                            console.error('Error deleting file', file, err);
                        } else {
                            console.log('Successfully deleted file', file);
                            return;
                        }
                    });
                }
            });
        });

        const targetDirectoryPath = path.join(transcodedDirectoryPath, videoName);

        fs.rm(targetDirectoryPath, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error('Error deleting the directory:', err);
            } else {
                console.log('Directory deleted successfully');
            }
        });


        // Delete a single record where videoName matches videoNameToDelete
        Video.deleteOne({ videoName: videoName }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Video with name '${videoName}' deleted successfully.`);
            }
        });
        res.json({ success: true });
    }
    catch {
        res.json({ success: false });
    }

})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

