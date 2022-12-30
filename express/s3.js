require('dotenv').config();
const fs = require('fs');

const S3 = require('aws-sdk/clients/s3');
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AED_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY


const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})
//uploads file to s3
function uploadFile(filePath, fileNameWithFolder) {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: fileNameWithFolder
    }
    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile

//download file from s3

function getFileStream(fileKey){
    console.log("file key is here", fileKey)
    const downloadParams ={
        Key: fileKey,
        Bucket: bucketName
    }
    
    return s3.getObject(downloadParams).createReadStream();
    // return s3.getObject(downloadParams)
}
exports.getFileStream = getFileStream



