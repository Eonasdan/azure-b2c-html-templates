import { ParvusServer } from '@eonasdan/parvus-server';
import Utilities from "./utilities.js";
import {FileHelpers} from "./file-helpers.js";
import chokidar from "chokidar";
import path from "path";

export default class Watcher {
    parvusServer
    builder;
    port = 62298;

    constructor(builder) {
        this.builder = builder;
        this.startAsync().then();
    }

    async startAsync() {
        await this.builder.updateAllAsync();
        this.parvusServer = new ParvusServer({
            port: this.port,
            directory: `./emulator`,
            middlewares: [

            ],
        });
        await this.parvusServer.startAsync();
        this.startFileWatcher();
    }

    refreshBrowser() {
        this.parvusServer.refreshBrowser();
    }

    startFileWatcher() {
        const output = './emulator'
        const samples = FileHelpers.stringToPath('./build/samples');
        const source = path.join('templates', 'Bootstrap');
        const styles = path.join('templates', 'src', 'styles');
        const js = path.join(source, 'js');
        const copy = path.join(source, 'assets');
        const assetIgnore = ['.html', '.css'];

        const watcher = chokidar.watch([styles, js, copy, path.join(source, '*.html'), samples], {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            ignoreInitial: true,
        });

        const handleChange = async (event, change) => {
            try {
                Utilities.log(`${event}: ${change}`);
                if (change.endsWith('.html')) {
                    await this.builder.updateHtmlAsync();
                }
                if (change.startsWith(styles)) {
                    await this.builder.updateCssAsync();
                    await FileHelpers.copyFileAsync(path.join(copy, 'css'), FileHelpers.stringToPath('./emulator/assets/css'), true);
                }
                if (change.startsWith(js)) {
                    await this.builder.minifyJsAsync();
                }
                if (change.startsWith(copy) && !assetIgnore.some(x => change.includes(x))) {
                    const destination = change.replace(copy, output);
                    switch (event) {
                        case 'change':
                        case 'add':
                            await FileHelpers.copyFileAsync(change, destination);
                            break;
                        case 'unlink':
                            await FileHelpers.removeFileAsync(destination);
                            break;
                    }
                }
                Utilities.log('Update successful');
                this.cleanTimer(this.refreshBrowser.bind(this));
            }
            catch (e) {
                console.log('Failed to update.', e);
            }
            console.log('');
        };

        watcher.on('all', handleChange).on('ready', () => {
            console.clear();
            console.log(
                `Serving at http://localhost:${this.port}`
            );
            console.log('[Make] Watching files...');
        });
    }

    cleanTimer(callback, delay = 1000) {
        let timer = setTimeout(() => {
            callback();
            clearTimeout(timer);
        }, delay);
    }
}
