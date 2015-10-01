'use strict';

let gulp = require('gulp');
let mocha = require('gulp-mocha');
let istanbul = require('gulp-istanbul');
let eslint = require('gulp-eslint');
let jscs = require('gulp-jscs');
let gutil = require('gulp-util');
let stylishJscs = require('jscs-stylish');

let sourceFiles = ['index.js', 'lib/**/*.js'];
let testSourceFiles = ['test/**/**.spec.js'];
let allSourceFiles = sourceFiles.concat(testSourceFiles);

gulp.task('test', function (done) {

  gulp.src(sourceFiles)
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      return gulp.src(testSourceFiles)
        .pipe(mocha())
        .on('error', gutil.log)
        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
        .pipe(istanbul.enforceThresholds({thresholds: {global: 100}})) // Enforce a coverage of at least 100%
        .on('end', done);

    })
    .on('error', gutil.log);
});

gulp.task('style', function () {

  return gulp.src(allSourceFiles)
    .pipe(jscs())
    .pipe(jscs.reporter(stylishJscs.path))
    .pipe(jscs.reporter('fail'));
});

gulp.task('lint', function () {

  return gulp.src(allSourceFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('check', ['lint', 'style']);

gulp.task('default', ['test', 'check']);
