import Build, { defaultDomain } from "./build.js";
import Watcher from "./watcher.js";
import {program} from "commander";

class Make {
    watcher;
    builder;

    /**
     * @type {Options}
     */
    options

    constructor(options) {
        this.options = options;
        this.builder = new Build(options);
    }

    async doAsync() {
        if (this.options.watch) this.watcher = new Watcher(this.builder);
        else if (this.options.pack) await this.builder.packAsync();
        else await this.builder.updateAllAsync();
    }
}

program
    .option('--watch', 'Runs the watch which keeps the browser up to date with your changes.')
    .option('--pack', 'Produces a folder with everything ready to go using the provided domain')
    .option('-t, --theme', 'What theme do you want to build/watch', 'Bootstrap5')
    .option('-d, --domain <domain>', 'Domain to use in the SCSS for images, e.g. #{$domain}/assets => https://foo.com', defaultDomain)
    .parse(process.argv)

new Make(program.opts()).doAsync().then();
