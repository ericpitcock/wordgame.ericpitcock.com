var gulp = require('gulp');
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');

/// PLUGIN CONFIG /////////////////////////////////////////////////////////

var pluginConfig = {
    autoprefixer: {
        browsers: ['last 2 versions']
    },
    browserSync: {
        port: 3004,
        proxy: 'wordgame.ericpitcock.dev',
        notify: false
    },
    notify: {
        title: 'Compile Error',
        message: '<%= error.message %>',
        sound: 'Funk'
    },
    plumber: {
        errorHandler: handleErrors
    },
    rename: {
        suffix: '.min'
    },
    sass: {
        outputStyle: 'compressed'
    }
}

/// HANDLE ERRORS /////////////////////////////////////////////////////////

function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError(pluginConfig.notify).apply(this, args);
    this.emit('end');
}

/// BROWSER SYNC /////////////////////////////////////////////////////////

gulp.task('browser-sync', function() {
    browserSync.init(pluginConfig.browserSync);
});

/// JADE /////////////////////////////////////////////////////////

gulp.task('jade', function() {
    gulp.src('src/index.jade')
        .pipe(jade())
        .pipe(gulp.dest('dist'));
});

/// SASS /////////////////////////////////////////////////////////

gulp.task('sass', function() {
    gulp.src('src/assets/sass/word-game.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(pluginConfig.sass))
        .pipe(autoprefixer(pluginConfig.autoprefixer))
        .pipe(rename(pluginConfig.rename))
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browserSync.stream());
});

/// JS HINT /////////////////////////////////////////////////////////

gulp.task('jshint', function() {
    gulp.src('src/assets/js/word-game.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/// JS /////////////////////////////////////////////////////////

gulp.task('js', function() {
    gulp.src([
        'src/assets/bower/jquery/dist/jquery.js',
        'src/assets/bower/jquery-color/jquery.color.js',
        'src/assets/bower/jquery-animateNumber/jquery.animateNumber.js',
        'src/assets/bower/fastclick/lib/fastclick.js',
        'src/assets/js/jquery.widowFix-1.3.2.min.js',
        'src/assets/js/modernizr.custom.76225.js',
        'config.js',
        'src/assets/js/word-game.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(plumber(pluginConfig.plumber))
    .pipe(concat('word-game.js'))
    .pipe(rename(pluginConfig.rename))
    .pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist/assets/js'));
});

/// WATCH /////////////////////////////////////////////////////////

gulp.task('watch', function() {
    gulp.watch('src/index.jade', ['jade']);
    gulp.watch('src/assets/js/word-game.js', ['jshint', 'js']);
    gulp.watch('src/assets/css/word-game.scss', ['sass']);
    gulp.watch('dist/index.html').on('change', browserSync.reload);
});

/// BUILD AND SERVE /////////////////////////////////////////////////////////

gulp.task('build', ['jade', 'jshint', 'sass', 'js']);

gulp.task('serve', ['browser-sync', 'watch']);

/// DEFAULT /////////////////////////////////////////////////////////

gulp.task('default', ['jade', 'jshint', 'sass', 'js', 'browser-sync', 'watch']);
