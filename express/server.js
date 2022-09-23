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


app.listen(3000, function () {
    console.log(`Server is running on port ${PORT}`);
});
