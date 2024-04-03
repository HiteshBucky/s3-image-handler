const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.upload = async (config, s3Params) => {
  const s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return s3Client.send(new PutObjectCommand(s3Params));
};

exports.getSignedUrl = async (config, s3Params, options = {}) => {
  const { expiresInSecond = 60 * 15 } = options;

  const s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new GetObjectCommand({
    ...s3Params,
  });

  const additionalOption = { expiresIn: expiresInSecond };

  // return s3Client.send(new GetObjectCommand(input));

  // Implement the logic to get the signed URL
  return getSignedUrl(s3Client, command, additionalOption);
};
