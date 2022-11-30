import Build from "./build.js";
import Watcher from "./watcher.js";

class Make {
    watcher;
    builder = new Build();

    async doAsync() {
        const args = process.argv.slice(2);
        this.builder.usePwa = !!args.includes('--pwa');
        if (args.includes('--watch')) this.watcher = new Watcher(this.builder);
        else await this.builder.updateAllAsync();
    }
}

new Make().doAsync().then();
