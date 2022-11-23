const sass = require('sass');
const fs = require('fs');//.promises;
const path = require('path');
const chokidar = require('chokidar');

class CompileScss {
    sassRoot = './templates/src/styles/';

    constructor(args) {
        if (args.includes('--watch')) this.startFileWatcher();
        else this.do();
    }
    
    writeFileAndEnsurePathExistsAsync(filePath, content) {
        fs.mkdirSync(path.dirname(filePath), {recursive: true});

        fs.writeFileSync(filePath, content);
    }

    do() {
        console.log('Compiling SCSS');
        const compileResult = sass.compile(`${this.sassRoot}styles.scss`, { sourceMap: true });
        this.sourceMap = compileResult.sourceMap.mappings;
        this.css = compileResult.css;

        this.writeFileAndEnsurePathExistsAsync('./emulator/css/styles.css', this.css);
        this.writeFileAndEnsurePathExistsAsync('./templates/Bootstrap523/assets/styles.css', this.css);
    }

    startFileWatcher() {
        const watcher = chokidar.watch([
            this.sassRoot
        ], {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            ignoreInitial: true
        });

        const handleChange = () => {
            this.do();
            console.log('Done');
            console.log('');
        }

        watcher
            .on('all', handleChange)
            .on('ready', () => {
                console.log('[SCSS] Watching files...');
                this.do();
            });
    }
}

new CompileScss(process.argv.slice(2));
