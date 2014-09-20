var gulp = require('gulp');
var rjs = require('gulp-requirejs');
 
gulp.task('default', function () {
 
});
 
gulp.task('rjs', function() {
    rjs({
        baseUrl: 'app',
        out: 'memapp.js',
        "name": "src/app",
        "deps": [],
        "paths": {
        },
        "shim": {
        }
    })
        .pipe(gulp.dest('./public/js')); // pipe it to the output DIR
});