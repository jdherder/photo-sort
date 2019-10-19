var ExifImage = require('exif').ExifImage;
var glob = require("glob");

(async () => {
  try {
    const imgPathsArr = await getFilePaths('/mnt/d/Transfer/godaddy/minecraft.jdherder.com/**/*');
    const exifDataArr = await Promise.all(imgPathsArr.map(readExif));
    const appleImgsArr = exifDataArr.filter(isApple);
  
    console.log(appleImgsArr.map(data => data.path));
  } catch (error) {
    console.error(error);
  }
})();

function getFilePaths(dir) {
  return new Promise((resolve, reject) => {
    glob(dir, {}, (er, paths) => {
      if (er) {
        return reject(er);
      }

      return resolve(paths);
    })
  });
}

function readExif(path) {
  return new Promise((resolve, reject) => {
    new ExifImage({ image: path }, (error, exif) => {
      const res = { path, exif, error };
      return error ? reject(res) : resolve(res);
    });
  });
}

function isApple(data) {
  return (data.exif.image && data.exif.image.Make) === 'Apple';
}