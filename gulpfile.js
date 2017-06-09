const gulp = require('gulp');
const runTasksInSequence = require('gulp-sequence');
const deleteFiles = require('del');
const renameFiles = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglifyJs = require('gulp-uglify');
const pump = require('pump');
const pathTool = require('path');



const sourceGlob = 'source/*.js';
const shouldUglifyJs = true;
const targetFolder = 'build';









gulp.task('clear old build', () => {
	return deleteFiles(pathTool.join(targetFolder, '/**/*'));
});

gulp.task('build: js', (onThisTaskDone) => {
	var actionsToTake = [
		gulp.src(sourceGlob)
	];

	if (shouldUglifyJs) {
		actionsToTake.concat([
			sourcemaps.init(),
			uglifyJs()
		]);
	}

	actionsToTake.push(renameFiles({suffix: '.min'}));

	if (shouldUglifyJs) {
		actionsToTake.push(
			sourcemaps.write('.')
		);
	}

	actionsToTake.push(gulp.dest(targetFolder));

	pump(actionsToTake, onThisTaskDone);
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