import Build from "./build.js";
import Watcher from "./watcher.js";
import {program} from "commander";

class Make {
    watcher;
    builder;
    options

    constructor(options) {
        this.options = options;
        this.builder = new Build(options);
    }

    async doAsync() {
        if (this.options.watch) this.watcher = new Watcher(this.builder);
        else await this.builder.updateAllAsync();
    }
}

program
    .option('--watch', 'Runs the watch which keeps the browser up to date with your changes.')
    .option('theme', 'What theme do you want to build/watch', 'Bootstrap5')
    .parse(process.argv)

new Make(program.opts()).doAsync().then();
