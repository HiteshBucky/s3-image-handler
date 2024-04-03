# S3-IMAGE-HANDLER

This package simplifies file management with Amazon S3, allowing users to easily upload and retrieve files without writing extensive code.

## Installation

```shell
$ npm install s3-image-handler
```

## Quick start

First you need to integrate s3-image-handler into your project by using the `require` function:

```javascript
const s3ImageHandler = require('s3-image-handler');
```

### Uploading a File

To upload a file to S3, use the `uploadFile` function:

```javascript
const file = req.files?.filter((file) => file.fieldname === 'fileWithSomeName')[0];

// I've provided placeholder credentials below, so please refrain from attempting to upload files with this data. Instead, kindly use your own AWS credentials. You can obtain your credentials from AWS.
const config = {
  accessKeyId: 'AJDJKLSDJKLJSDKDKLSL', // Enter your access key here
  secretAccessKey: 'hY7uuu+dksdk+99as9dsjksdljskld', // Enter your secret key here
  region: 'ap-south-1', // Enter your region here example: ap-south-1
  bucket: 'bucket1', //Enter your bucket name here:
};
const response = await s3Module.uploadFile(config, file);
console.log('response', response); // { "key": "61b11f67-b9e7-432c-84e1-74801c1d30ef.png", "url": "https://<Unsigned URL path>/<Key Name>" }

// If we want the signed url then we have to send fetchedSignedUrl flag in the options parameter
const options = { fetchedSignedUrl: true };
const response = await s3Module.uploadFile(config, file, options);
console.log('response', response); // { "key": "61b11f67-b9e7-432c-84e1-74801c1d30ef.png", "url": "https://<Unsigned URL path>/<Key Name>", "signedUrl": "https://<Unsigned URL path>/<Key Name>?queryParams" }
```

### Retrieving a File

```javascript
const config = {
  accessKeyId: 'AJDJKLSDJKLJSDKDKLSL', // Enter your access key here
  secretAccessKey: 'hY7uuu+dksdk+99as9dsjksdljskld', // Enter your secret key here
  region: 'ap-south-1', // Enter your region here example: ap-south-1
  bucket: 'bucket1', //Enter your bucket name here:
};
const keyName = '61b11f67-b9e7-432c-84e1-74801c1d30ef.png';
const response = await s3Module.getSignedUrlFromKey(config, keyName);

console.log('response', response); // https://bucket1.s3.ap-south-1.amazonaws.com/61b11f67-b9e7-432c-84e1-74801c1d30ef.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X
```

### Retrieving a File with Expiry Time for signed URL
We can pass additional options in getSignedUrlFromKey(). Here we have to pass expiresInSecond key and the value. By default the signed url will have an expiry of 15 minutes.

```javascript
const config = {
  accessKeyId: 'AJDJKLSDJKLJSDKDKLSL', // Enter your access key here
  secretAccessKey: 'hY7uuu+dksdk+99as9dsjksdljskld', // Enter your secret key here
  region: 'ap-south-1', // Enter your region here example: ap-south-1
  bucket: 'bucket1', //Enter your bucket name here:
};
const keyName = '61b11f67-b9e7-432c-84e1-74801c1d30ef.png';
const options = { expiresInSecond: 60 };
const response = await s3Module.getSignedUrlFromKey(config, keyName, options);

console.log('response', response); // https://bucket1.s3.ap-south-1.amazonaws.com/61b11f67-b9e7-432c-84e1-74801c1d30ef.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X
```


## Example to upload image in express js

Step 1: Setup multer: We will need multer so that we can access the files that are uploaded while calling our api

```javascript
const multer = require('multer');
const dataCollectionStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, os.tmpdir());
  },
  filename: function (req, file, callback) {
    callback(null, `${req.params.userId}-${file.fieldname}-${file.originalname}`);
  },
});
```

Step 2: Create a route for and integrate multer with it

```javascript
const os = require('os');
const router = require('express')();

const uploadMiddleware = multer({ storage: dataCollectionStorage });

router.route('/test').post(uploadMiddleware.any(), controller.test);

module.exports = router;
```

Step 3: Lets wtite the controller

```javascript
exports.uploadFile = async (req, res, next) => {
  try {
    const file = req.files?.filter((file) => file.fieldname === 'fileWithSomeName')[0];

    const config = {
      accessKeyId: 'AJDJKLSDJKLJSDKDKLSL', // Enter your access key here
      secretAccessKey: 'hY7uuu+dksdk+99as9dsjksdljskld', // Enter your secret key here
      region: 'ap-south-1', // Enter your region here example: ap-south-1
      bucket: 'bucket1', //Enter your bucket name here:
    };
    const options = { fetchedSignedUrl: true };
    const response = await s3Module.uploadFile(config, file, options);

    return res.json({
      code: '200',
      message: 'Test API to upload file to s3 bucket successfully',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};
```
