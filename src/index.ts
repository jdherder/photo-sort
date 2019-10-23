import exif from 'exif';
import glob from 'glob';

export interface ExifData {
  path: string
  exif: exif.ExifData,
  error: Error
}

(async () => {
  try {
    const imgPathsArr = await getFilePaths('/mnt/d/Archive/Photo\\ Library/2019/**/*.{jpg, jpeg}');
    const exifDataArr = await Promise.all(imgPathsArr.map(readExif));
    const imagesWithExifData = exifDataArr.filter(img => img.exif.image);

    console.log(`Found ${imagesWithExifData.length} images with EXIF data.`);

    const models = imagesWithExifData.map(img => img.exif.image.Model);
    const uniqueModels = Array.from(new Set(models));

    console.log(`From the following devices: ${uniqueModels.join(', ')}`);

  } catch (error) {
    console.error(error);
  }
})();

function getFilePaths(dir: string): Promise<string[]> {
  console.log(`Getting individual file paths in ${dir}`);
  return new Promise((resolve, reject) => {
    glob(dir, { nocase: true }, (er, paths) => {
      if (er) {
        return reject(er);
      }

      return resolve(paths);
    })
  });
}

function readExif(path: string): Promise<ExifData> {
  return new Promise((resolve, reject) => {
    new exif.ExifImage({ image: path }, (error, exif) => {
      return resolve({ path, exif, error });
    });
  });
}

function isApple(data: ExifData) {
  return (data.exif.image && data.exif.image.Make) === 'Apple';
}