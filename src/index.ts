import exif from 'exif';
import glob from 'glob';
import cliProgress from 'cli-progress';

export interface ExifData {
  path: string
  exif: exif.ExifData,
  error: Error
}

(async () => {
  try {
    const bar = new cliProgress.Bar({ clearOnComplete: true }, cliProgress.Presets.shades_classic);
    const imgPathsArr = await getFilePaths('/mnt/d/Archive/Photo\\ Library/2019/**/*.{jpg, jpeg}');

    bar.start(imgPathsArr.length, 0);

    const exifDataArr = await Promise.all(imgPathsArr.map(path => readExif(path, bar)));
    const imagesWithExifData = exifDataArr.filter(img => img.exif.image);

    bar.stop();

    console.log(`Found ${imagesWithExifData.length} images with EXIF data.`);

    const models = imagesWithExifData.map(img => img.exif.image.Model);
    const uniqueModels = Array.from(new Set(models));

    console.log(`Device list: ${uniqueModels.join(', ')}`);

  } catch (error) {
    console.error(error);
  }
})();

function getFilePaths(dir: string): Promise<string[]> {
  console.log(`Getting individual file paths for: ${dir}`);
  return new Promise((resolve, reject) => {
    glob(dir, { nocase: true }, (er, paths) => {
      if (er) {
        return reject(er);
      }

      return resolve(paths);
    })
  });
}

function readExif(path: string, bar: cliProgress.Bar): Promise<ExifData> {
  return new Promise((resolve) => {
    new exif.ExifImage({ image: path }, (error, exif) => {
      bar.increment(1);
      return resolve({ path, exif, error });
    });
  });
}

function isApple(data: ExifData) {
  return (data.exif.image && data.exif.image.Make) === 'Apple';
}