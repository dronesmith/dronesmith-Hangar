var gulp = require('gulp'),
    less = require('gulp-less');



gulp.task('less', function () {
   gulp.src('public/app/app.less')
      .pipe(less())
      .pipe(gulp.dest('public/app'));
});
