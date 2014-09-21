'use strict';


var config = {
  paths: {
    src: {
      scripts: "app/src/**/*.js",
      styles: "app/src/css/**/*.scss",
      livereload: ["public/**/*"],
      vendor: "app/vendor/**",
      html: "app/src/templates/**/*.html"
    },
    dest: {
      vendor: "public/vendor",
      html: "public/templates"
    }
  }
};

var gulp = require('gulp'),
  rjs = require("gulp-requirejs"),
  rename = require('gulp-rename'),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  livereload = require('gulp-livereload'),
  newer = require('gulp-newer'),
  livereloadServer = livereload(35729);

module.exports = gulp.task('watch', function () {
  gulp.watch(config.paths.src.livereload)
    .on('change', function (file) {
      livereloadServer.changed(file.path);
    });
  // TODO: Find a proper way to ignore "possible EventEmitter memory leak detected", handled by maxListeners ATM
  gulp.watch(config.paths.src.scripts, {
    maxListeners: 999999
  }, ['lint', 'rjs']);
  gulp.watch(config.paths.src.html, {
    maxListeners: 999999
  }, ['html']);
  gulp.watch(config.paths.src.styles, {
    maxListeners: 999999
  }, ['styles']);
});


function handleError(err) {
  console.log(err.toString());
}

gulp.task('styles', function () {
  return gulp.src("./app/src/css/index.scss")
    .pipe(sass()
      .on('error', handleError))
    .pipe(autoprefixer('last 1 version'))
    .pipe(rename('app.css'))
    .pipe(gulp.dest('./public/css'));
});


gulp.task('html', function () {
  return gulp.src(config.paths.src.html)
    .pipe(gulp.dest(config.paths.dest.html));
});

module.exports = gulp.task('lint', function () {
  return gulp.src(config.paths.src.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});


gulp.task('default', ["lint", "rjs", "styles", "html", "vendor"], function () {
  gulp.run("watch");
});

gulp.task('vendor', function () {
  return gulp.src(config.paths.src.vendor)
    .pipe(newer(config.paths.dest.vendor))
    .pipe(gulp.dest(config.paths.dest.vendor));
});

gulp.task('rjs', function () {
  rjs({
    baseUrl: 'app',
    out: 'memapp.js',
    "name": "src/app",
    "deps": [],
    "paths": {},
    "shim": {}
  })
    .pipe(gulp.dest('./public/js')); // pipe it to the output DIR
});
