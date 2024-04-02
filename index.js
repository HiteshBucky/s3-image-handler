const fs = require('fs');
const Joi = require('joi');
const crypto = require('crypto');
const s3Helper = require('./s3.helper');
const { fileTypes: FILETYPES, contentTypeMapper } = require('./utils');

const S3ConfigSchema = Joi.object({
  accessKeyId: Joi.string().trim().required().messages({
    'string.base': 'Access Key ID must be a string',
    'any.required':
      'Invalid S3 configuration. Missing required fields. Access Key ID is required to create a S3Helper Object',
  }),
  secretAccessKey: Joi.string().trim().required().messages({
    'string.base': 'Secret Access Key must be a string',
    'any.required':
      'Invalid S3 configuration. Missing required fields. Secret Access Key is required to create a S3Helper Object',
  }),
  region: Joi.string().trim().required().messages({
    'string.base': 'Region must be a string',
    'any.required':
      'Invalid S3 configuration. Missing required fields. Region is required to create a S3Helper Object',
  }),
  bucket: Joi.string().trim().required().messages({
    'string.base': 'Bucket must be a string',
    'any.required':
      'Invalid S3 configuration. Missing required fields. Bucket is required to create a S3Helper Object',
  }),
  folder: Joi.string().trim().optional(),
  acl: Joi.string().trim().optional(),
  expiresInMinutes: Joi.number().optional(),
})
  .required()
  .messages({
    'object.unknown': 'Invalid S3 configuration. Unknown field {#label}',
    'any.required': 'Invalid S3 configuration. Missing required fields',
  });

/**
 * @param {object} config
 * @param {string} config.accessKeyId
 * @param {string} config.secretAccessKey
 * @param {string} config.region Region where you want to store the file
 * @param {string} config.bucket Bucket Name where you want to store the file
 * @param {string?} config.folder Folder Name where you want to store the file
 * @param {string?} config.acl Access Control List
 * @param {string?} config.expiresInMinutes Expiry Time for the Signed URL
 *
 * @param {*} data : File Data that needs to be uploaded
 * @param {*} options : Additional Options
 * @param {string} options.key : Key Name for the file
 * @param {boolean} options.fetchedSignedUrl : Fetch Signed URL for the file otherwise function will return only unsigned url
 * @param {string} options.fileType : File Type for the file
 * @returns
 */

exports.uploadFile = async (config, data, options = {}) => {
  // Validate the Request
  const { error, value: s3Config } = S3ConfigSchema.validate(config);
  if (error) {
    throw new Error(`Invalid S3 configuration: ${error.details[0].message}`);
  }

  // Destrcuture the options
  let { key, fetchedSignedUrl = false, fileType = null } = options;

  // Validate the fileType
  if (fileType && !Object.values(FILETYPES).includes(fileType)) {
    throw new Error(`Invalid fileType: ${fileType}`);
  }
  // Validate Mime Type
  if (!(data.mimetype && Object.values(contentTypeMapper).includes(data.mimetype))) {
    throw new Error('Invalid File Types. We do now support given file type');
  }
  // Validate key.extension
  const extenstion = key?.split('.').pop();
  if (key && extenstion && Object.values(FILETYPES).includes(extenstion)) {
    throw new Error('Invalid File Types in key name. We do now support given file type');
  }

  fileType = fileType =
    Object.keys(contentTypeMapper).filter(
      (mimetype) => contentTypeMapper[mimetype] === data.mimetype
    )[0] ||
    extenstion ||
    fileType ||
    null;

  const customKey = `${crypto.randomUUID()}.${fileType}`;
  const keyName = key || customKey;

  const s3params = {
    Bucket: config.bucket,
    Key: keyName,
    Body: fs.createReadStream(data.path),
    ContentEncoding: 'base64', // allows API clients to request content to be compressed before being sent back in the response to an API request.
    ContentType: contentTypeMapper[fileType],
  };

  await s3Helper.upload(s3Config, s3params);

  const url = this.getUnsignedUrlFromKey(s3Config, keyName);

  let signedUrl;
  if (fetchedSignedUrl) {
    signedUrl = await this.getSignedUrlFromKey(s3Config, keyName);
  }

  return { key: keyName, url, signedUrl };
};

// Getters
exports.getUnsignedUrlFromKey = (config, key) => {
  const { region, bucket } = config;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

exports.getSignedUrlFromKey = async (config, key) => {
  const s3params = {
    Bucket: config.bucket,
    Key: key,
  };
  const signedUrl = await s3Helper.getSignedUrl(config, s3params);

  return signedUrl;
};
