const gulp = require('gulp');
const runTasksInSequence = require('gulp-sequence');
const deleteFiles = require('del');
const renameFiles = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglifyJs = require('gulp-uglify');



const sourceGlob = 'source/*.js';


gulp.task('clear old build', () => {
	return deleteFiles('build/**/*')
});

gulp.task('build: js', () => {
	return gulp.src(sourceGlob)
		.pipe(sourcemaps.init())
		.pipe(uglifyJs())
		.pipe(renameFiles({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build'))
		;
});

gulp.task('build: all', (onThisTaskDone) => {
	runTasksInSequence(
		'clear old build',
		['build: js']
	)(onThisTaskDone);
});

gulp.task('watch', [], () => {
	return gulp.watch(sourceGlob, ['build: all']);
});

gulp.task('default', (onThisTaskDone) => {
	runTasksInSequence('build: all', 'watch')(onThisTaskDone);
});