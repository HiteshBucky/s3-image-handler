const fileTypes = {
  jpeg: 'jpeg',
  png: 'png',
  pdf: 'pdf',
  jpg: 'jpg',
};

const contentTypeMapper = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  binary: 'application/octet-stream',
};

module.exports = {
  fileTypes,
  contentTypeMapper,
};
