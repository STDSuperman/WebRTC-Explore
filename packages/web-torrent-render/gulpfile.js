const gulp = require("gulp");
const browserify = require("browserify");
const tsify = require("tsify");
const source = require("vinyl-source-stream");
const babelify = require("babelify");
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./tsconfig.json');
const path = require('path');

// gulp.task('typescript', function() {
//   const tsResult = tsProject.src().pipe(tsProject());
//   return tsResult.js.pipe(gulp.dest('dist/'));
// });

const entryFiles = ["src/index.ts", "src/worker.ts"];

const buildTsFile = filepath => {
  const parsedUrlInfo = path.parse(filepath);
  return () => {
    return browserify({
      basedir: ".",
      debug: true,
      entries: filepath,
      cache: {},
      packageCache: {}
    })
      .plugin(tsify, { noImplicitAny: true, tsProject })
      .transform(babelify.configure({
        presets: ["@babel/preset-env"],
        extensions: [".ts", '.js']
      }))
      .bundle()
      .on("error", e => console.log(e))
      .pipe(source(`${parsedUrlInfo.name}.js`))
      .pipe(gulp.dest("dist"));
  }
}

gulp.task('copy', () => {
  return gulp
    .src('./public/*')
    .pipe(gulp.dest('dist'))
})


gulp.task("default", gulp.series(
  buildTsFile("src/worker.ts"),
  buildTsFile("src/index.ts"),
  'copy'
));