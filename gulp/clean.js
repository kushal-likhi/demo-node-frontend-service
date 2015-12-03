'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*'],
    requireFn: function(name){
       return require(name);
    }
});

gulp.task('clean', function () {
    return gulp.src(
        ['.tmp', 'web-app/dist', 'web-app/views/min'],
        { read: false }
    ).pipe($.rimraf());
});
