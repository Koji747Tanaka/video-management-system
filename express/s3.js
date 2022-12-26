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

//uploads a folder to s3
// function uploadFile(folderPath) {
//     const filenames = fs.readdirSync(folderPath)
//     filenames.forEach((filename) => {

//     })

//     const fileStream = fs.createReadStream(filepath);
//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: fileName
//     }
//     return s3.upload(uploadParams).promise()
// }

exports.uploadFile = uploadFile
//download file from s3

