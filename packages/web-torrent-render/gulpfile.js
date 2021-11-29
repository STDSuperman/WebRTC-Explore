const gulp = require("gulp");
const browserify = require("browserify");
const tsify = require("tsify");
const source = require("vinyl-source-stream");
const babelify = require("babelify");
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./tsconfig.json');
const path = require('path');
const server = require("browser-sync").create();

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

const buildAllTsFile = () => {
  const entries = ["src/worker.ts", "src/index.ts"]
  return gulp.series(entries.map(filepath => buildTsFile(filepath)))
}

gulp.task('copy', () => {
  return gulp
    .src('./public/*')
    .pipe(gulp.dest('dist'))
})

gulp.task('server', function() {
  return server.init({
    server: {
      baseDir: './dist'
    }
  });
});

gulp.task("default", gulp.series(
  buildAllTsFile(),
  'copy',
  'server'
));
