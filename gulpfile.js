const { stream: gherkin2robot } = require('.')

const { exec } = require('child_process')
const gulp = require('gulp')
const log = require('fancy-log')

gulp.task('gherkin2robot', () =>
	gulp.src('test/*.feature')
		.pipe(gherkin2robot({ stepdefsPath: '../test/stepdefs.robot' }))
		.pipe(gulp.dest('temp'))
)

gulp.task('copy examples', () =>
	gulp.src('test/examples/*', { base: 'test' })
		.pipe(gulp.dest('temp'))
)

gulp.task('execute robot', [ 'gherkin2robot', 'copy examples' ], done => {
	exec('robot -N gherkin2robot *.robot', { cwd: 'temp' }, (err, stdout, stderr) => {
		if (err) {
			console.log(stdout)
			done('Some tests have failed.')
		} else {
			done()
		}

		log('Test execution completed. See temp/report.html')
	})
})

gulp.task('default', [ 'execute robot' ])
