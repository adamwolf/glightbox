const jscompiler = require('./jscompiler');
const path = require("path");
const notify = require("./notifications");
const fs = require("fs");
const terser = require("terser");
const postcssCompiler = require("./postcss");

let config = {
    js: {
        src: 'src/js',
        dest: 'dist/js',
    },
    css: {
        src: 'src/postcss',
        dest: 'dist/css',
    }
};

/**
 * Handle Javascript files
 * compile the javascript files
 * to es2015, minify and sync the files
 *
 * @param {string} file path
 */
async function handleJavascript(file) {
    file = path.join(config.js.src, 'glightbox.js');

    const name = path.basename(file);

    const res = await jscompiler({
        file,
        dest: config.js.dest,
        format: 'umd',
        sourcemap: false,
        moduleID: 'GLightbox'
    }).catch(error => console.log(error));

    if (!res) {
        notify('Build Error', `View logs for more info`);
        console.log(res)
        return false;
    }

    const minName = name.replace('.js', '.min.js');
    const processed = path.join(config.js.dest, name);
    const code = fs.readFileSync(processed, 'utf8');
    let minified;
    try {
        minified = terser.minify(code);
    } catch (error) {
        console.log(error);
        return false;
    }

    if (minified && minified.error) {
        console.log(minified.error);
        return false;
    }
    const minifyPath = path.join(config.js.dest, minName);
    fs.writeFileSync(minifyPath, minified.code);

    notify('Javascript Build', `Compiled and Minified ${name}`);
}


/**
 * Handle Postcss files
 * compile the css files
 *
 * @param {string} file path
 */
async function handlePostCSS(file) {
    file = path.join(config.css.src, 'glightbox.css');
    const name = path.basename(file);
    const dest = config.css.dest;

    let res = await postcssCompiler({
        file,
        dest,
        minify: true
    }).catch(error => console.log(error));
    if (!res) {
        return false;
    }
    notify('PostCSS Build', `Compiled and Minified ${name}`);
}

function build() {
    handleJavascript();
    handlePostCSS();
}


module.exports = {
    'handleJavascript': handleJavascript,
    'handlePostCSS': handlePostCSS,
    'build': build
}
