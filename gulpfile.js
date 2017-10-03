const gulp = require('gulp');
const del = require('del');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
// styles
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
// scripts
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
// svg icons
const rsp = require('remove-svg-properties').stream;
//fonts
const ttf2woff = require('gulp-ttf2woff');


// для удобства все пути в одном месте
const paths = {
    root: './build',
    templates: {
        src: 'src/templates/**/*.pug',
        dest: 'build/assets/'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'build/assets/styles/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts/'
    },
    images: {
        src: 'src/images/**/*.*',
        dest: 'build/assets/images/'
    },
    fontsTtf: {
        src: 'src/fonts/**/*.ttf',
        dest: 'build/assets/fonts/'
    },
    svg: {
        src: 'src/svg/*.svg',
        dest: 'src/images/icons/'
    }
};
// pug
function templates() {
    return gulp.src('./src/templates/pages/*.pug')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.root));
}

// scss
function styles() {
    return gulp.src('./src/styles/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.styles.dest))
}

// очистка папки build
function clean() {
    return del(paths.root);
}

// webpack
function scripts() {
    return gulp.src('src/scripts/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(paths.scripts.dest));
}


// просто переносим картинки
function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}
// обрабатывает и копируем svg
function svgIcons() {
    return gulp.src(paths.svg.src)
        .pipe(rsp.remove({
            properties: [rsp.PROPS_FILL]
        }))
        .pipe(gulp.dest(paths.svg.dest));
}

//

 function ttfFonts(){
    return gulp.src(paths.fontsTtf.src)
        .pipe(ttf2woff())
        .pipe(gulp.dest(paths.fontsTtf.dest));
}


// следим за src и запускаем нужные таски (компиляция и пр.)
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.images.src, templates);
    gulp.watch(paths.images.src, images);
}

// следим за build и релоадим браузер
function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}


// экспортируем функции для доступа из терминала (gulp clean)
exports.clean = clean;
exports.templates = templates;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.server = server;
exports.svgIcons = svgIcons;
exports.ttfFonts = ttfFonts;

// сборка и слежка
gulp.task('default', gulp.series(
    clean,svgIcons,ttfFonts,
    gulp.parallel(styles,templates,images,scripts),
    gulp.parallel(watch, server)
));