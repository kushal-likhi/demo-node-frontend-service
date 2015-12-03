'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license'],
    requireFn: function(name){
        return require(name);
    }
});
function handleError(err) {
    console.error(err.toString());
    this.emit('end');
}

gulp.task('styles', function () {
    return gulp.src('web-app/public/**/*.scss')
        .pipe($.sass({style: 'expanded'}))
        .on('error', handleError)
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp'))
        .pipe($.size());
});

gulp.task('stylesCSS', function () {
    return gulp.src('web-app/public/**/*.css')
        .on('error', handleError)
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp'))
        .pipe($.size());
});

gulp.task('scripts', [/*'lint'*/], function () {
    return gulp.src('web-app/public/**/*.js')
//        .pipe($.jshint())
//        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.size());
});

gulp.task('partials', function () {
    return gulp.src('web-app/public/partials/**/*.html')
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe($.ngHtml2js({
            moduleName: 'purpleFrontend'
        }))
        .pipe(gulp.dest('.tmp'))
        .pipe($.size());
});

gulp.task('helpers', function(){
    gulp
        .src('web-app/views/dev/**/*.js')
        .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
        .pipe(gulp.dest('web-app/views/min'))
        .pipe($.size());
});

gulp.task('views',['helpers'], function(){
    gulp
        .src('web-app/views/dev/**/*.html')
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest('web-app/views/min'))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts', 'partials', 'views'], function () {
    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    return gulp.src('web-app/public/*.html')
        .pipe($.inject(gulp.src('.tmp/partials/**/*.js'), {
            read: false,
            starttag: '<!-- inject:partials -->',
            addRootSlash: false,
            addPrefix: '../'
        }))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest('web-app/dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('web-app/public/images/**/*')
        /*.pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))*/
        .pipe(gulp.dest('web-app/dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src('web-app/public/bower_components/**/*.{eot,svg,ttf,woff}')
        .pipe($.flatten())
        .pipe(gulp.dest('web-app/dist/fonts'))
        .pipe($.size());
});

gulp.task('favicon', function () {
    return gulp.src('web-app/public/favicon.ico')
        .pipe($.flatten())
        .pipe(gulp.dest('web-app/dist'))
        .pipe($.size());
});

gulp.task('build', ['clean', 'wiredep', 'html', 'images', 'fonts', 'favicon']);
