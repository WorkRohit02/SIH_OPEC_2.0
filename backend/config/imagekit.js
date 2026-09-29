const ImageKit = require('imagekit');
const env = require('./env');

let imagekitInstance = null;

if (env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT) {
  imagekitInstance = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });
} else {
  console.warn('[ImageKit] ImageKit credentials missing in environment. Using fallback mode for local media references.');
}

module.exports = imagekitInstance;
