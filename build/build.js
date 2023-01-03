import {FileHelpers} from "./file-helpers.js";
import {promises as fs} from "fs";
import {JSDOM} from 'jsdom';
import CleanCSS from "clean-css";
//todo not sure why "default" is required but node is stupid
import {default as sass} from "sass";

/**
 * CLI options
 * @typedef {Object} Options
 * @property {boolean} watch - Use the watcher
 * @property {string} theme - Which theme to load
 * @property {string} domain - Replace the localhost domain in the SCSS with this value
 */

export default class Build {
    examplesMap = {
        unified: [
            'sign-in'
        ],
        selfAsserted: [
            'forgot-password',
            'sign-up'
        ]
    }

    /**
     * @type {Options}
     */
    options;


    constructor(options) {
        this.options = options;
    }

    async loadTemplateAsync(template) {
        const file = await fs.readFile(
            `./themes/${this.options.theme}/templates/${template}.html`,
            'utf8'
        );

        return new JSDOM(file).window.document;
    }

    async loadSampleAsync(template) {
        const file = await fs.readFile(
            `./build/samples/${template}.html`,
            'utf8'
        );

        return new JSDOM(file).window.document;
    }

    async updateAllAsync() {
        await this.updateCssAsync();
        await this.updateHtmlAsync();
        await FileHelpers.copyFileAsync(`./themes/${this.options.theme}/templates/assets`, './emulator/assets', true);
        await FileHelpers.copyFileAsync(`./build/samples/favicon.ico`, './emulator/favicon.ico');
    }

    async updateHtmlAsync() {
        await FileHelpers.removeDirectoryAsync('./emulator', false);

        const pages = [];

        for (const k of Object.keys(this.examplesMap)) {
            const template = await this.loadTemplateAsync(k);

            for (const v of this.examplesMap[k]) {
                //todo maybe load all the samples in one go?
                //problem might be if the sample gets changed, it won't be reloaded
                const example = await this.loadSampleAsync(v);

                template.getElementById('api').innerHTML = example.documentElement.innerHTML;

                pages.push(v);

                await FileHelpers.writeFileAndEnsurePathExistsAsync(
                    `./emulator/${v}.html`,
                    template.documentElement.innerHTML
                );
            }
        }

        await this.generateIndexAsync(pages);
    }

    async updateCssAsync() {
        try {
            const sourceMapComment = '/*# sourceMappingURL=style.css.map */';

            const compileResult = sass.compile(`./themes/${this.options.theme}/src/styles/main.scss`, {
                sourceMap: true,
                functions: {
                    'getDomain()': () => {
                        return new sass.SassString(this.options.domain);
                    }
                }
            });

            const sourceMap = compileResult.sourceMap;

            let cleanedCss = new CleanCSS().minify(compileResult.css).styles;
            cleanedCss += sourceMapComment;

            await FileHelpers.writeFileAndEnsurePathExistsAsync(
                `./themes/${this.options.theme}/templates/assets/css/style.css`,
                compileResult.css += sourceMapComment
            );
            await FileHelpers.writeFileAndEnsurePathExistsAsync(
                `./themes/${this.options.theme}/templates/assets/css/style.min.css`,
                cleanedCss
            );
            await FileHelpers.writeFileAndEnsurePathExistsAsync(
                `../themes/${this.options.theme}/templates/assets/css/style.css.map`,
                JSON.stringify(sourceMap)
            );
        } catch (e) {
            console.log('Failed to update SASS', e)
        }
    }

    async generateIndexAsync(pages) {
        const dom = new JSDOM(`<!DOCTYPE html><html lang="en">
<head>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
</head>
<body style="background-color: #171717;color: #e3e3e3;">
<ul class="nav flex-column">
${pages.map(p => `<li class="nav-item"><a class="nav-link link-light" href="${p}.html">${p}</a></li>`).join('<br/>')}
</ul></body></html>`);

        await FileHelpers.writeFileAndEnsurePathExistsAsync(
            `./emulator/index.html`,
            dom.window.document.documentElement.innerHTML
        );
    }
}
