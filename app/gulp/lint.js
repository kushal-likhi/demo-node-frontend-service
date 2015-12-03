'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*'],
    requireFn: function(name){
        return require(name);
    }
});

gulp.task('lint', function () {
    return gulp.src([
            '!./node_modules/**/*.js',
            '!./web-app/public/bower_components/**/*.js',
            '!./custom_modules/hapi-swagger/**/*.js',
            '!./devOps/**/*.js',
            '!./gulp/**/*.js',
            './**/*.js'
        ])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.size());
});
