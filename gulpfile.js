var gutil = require('gulp-util');
var gulp = require('gulp');
var tsc = require('gulp-typescript-compiler');
var run = require('gulp-run');
var less = require('gulp-less');

gulp.task('less', function() {
    return gulp
        .src('src/*.less')
        .pipe(less())
        .pipe(gulp.dest('src'));
});

gulp.task('typescript', function() {
    run('tsc.cmd --target ES5 --out src/customdeck.js src/customdeck.ts').exec().on('error', gutil.log);
    //run('tsc.cmd --target ES5 --out src/virtualdeck.js src/virtualdeck.ts').exec().on('error', gutil.log);
    run('tsc.cmd --target ES5 --out src/mancala.js src/mancala.ts').exec().on('error', gutil.log);
});

gulp.task('watch', function() {
    gulp.watch('src/*.ts', ['typescript']);
    gulp.watch('src/*.less', ['less']);
});

gulp.task('default', ['typescript', 'less', 'watch']);
