const gulp = require('gulp');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const tailwindcss = require('tailwindcss');
const gulpPug = require('gulp-pug');

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
}

function tailwindCss() {
  const plugins = [
    tailwindcss(),
    autoprefixer(),
    mediaquery(),
    cssnano()
  ];

  return gulp.src('src/styles/main.css')  // ← один файл
    .pipe(plumber())
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/styles/'))         // → dist/css/main.css
    .pipe(browserSync.reload({stream: true}));
}

function images() {
  // Копируем ВСЕ файлы из папки images
  return gulp.src('src/images/**/*', { encoding: false })
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({stream: true}));
}

function clean() {
  return del('dist');
}

function pug() {
  return gulp.src('src/pages/**/*.pug')
        .pipe(gulpPug())
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}

function watchFiles() {
  gulp.watch(['src/**/*.pug'], pug);
  gulp.watch(['src/styles/**/*.css'], tailwindCss); 
  gulp.watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
  gulp.watch(['tailwind.config.js'], tailwindCss);
}

const build = gulp.series(clean, gulp.parallel(pug, tailwindCss, images));
const watchapp = gulp.parallel(build, watchFiles, serve);  

exports.clean = clean;
exports.tailwindCss = tailwindCss;
exports.images = images;
exports.pug = pug;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;