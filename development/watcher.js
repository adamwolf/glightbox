const chokidar = require('chokidar');
const notify = require('./notifications');
const builder = require('./builder');


/**
 * Watcher
 * what the files for the backedn
 * this includes js and css files
 */
function filesWatcher() {
    const watcher = chokidar.watch(['src'], {
        ignored: ['.DS_Store', 'src/js/.jshintrc', 'src/js/.babelrc'],
        persistent: true,
        depth: 3,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 500
        },
    });

    watcher.on('change', path => {
        if (path.endsWith('.js')) {
           return builder.handleJavascript(path);
        }
        if (path.endsWith('.css')) {
            return builder.handlePostCSS(path);
        }
    })
    watcher.on('ready', () => notify('Watching files', 'Initial scan complete. Ready for changes'))
}

filesWatcher();
