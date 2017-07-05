var gulp = require('gulp');
var imagemin = require('gulp-imagemin');

function processImg(filesrc) {
    console.log(filesrc);
 return gulp.src(filesrc)

  .pipe(imagemin({optimizationLevel: 5}))

  .pipe(gulp.dest('./userUploads/'))
}

process.on('message', function (images) {
  console.log('Image processing started...');
  var stream = processImg(images);
  stream.on('end', function () {
    process.send('Image processing complete');
    process.exit();
  });
  stream.on('error', function (err) {
    process.send(err);
    process.exit(1);
  });
});
