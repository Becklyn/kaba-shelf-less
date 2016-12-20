const chalk = require("chalk");
const csso = require("csso");
const fs = require("fs-extra");
const glob = require("glob");
const less = require("less");
const LessPluginAutoPrefixer = require("less-plugin-autoprefix");
const Logger = require("../lib/logger");
const path = require("path");
const Promise = require("bluebird");


/**
 * LESS task handler that handles compilation of all files in a given directory
 *
 * @type {LessDirectoryTask}
 */
module.exports = class LessDirectoryTask
{
    /**
     *
     * @param {string} directory
     * @param {LessTaskConfig} config
     */
    constructor (directory, config)
    {
        /**
         * @private
         * @type {string}
         */
        this.directory = directory.replace(/\/*$/, "") + "/";

        /**
         * @private
         * @type {LessTaskConfig}
         */
        this.config = config;


        /**
         * @private
         * @type {Logger}
         */
        this.logger = new Logger("LESS", "blue", this.directory);
    }


    /**
     * Compiles the file
     *
     * @param {bool} debug
     * @return {Promise}
     */
    compile (debug)
    {
        return this.findAllFiles()
            .then(
                (files) => {
                    const tasks = files.map(
                        (file) =>
                        {
                            let pipe = this.readFile(file)
                                .then((data) => this.compileFile(file, data, debug));

                            if (!debug)
                            {
                                pipe = pipe
                                    .then((css) => this.minify(css));
                            }

                            return pipe
                                .then((data) => this.writeFile(file, data));
                        }
                    );

                    return Promise.all(tasks);
                }
            );
    }


    /**
     * Finds all files
     *
     * @private
     * @return {Promise}
     */
    findAllFiles ()
    {
        const rootFiles = this.directory + "*.less";

        return new Promise(
            (resolve, reject) => {
                glob(rootFiles, {absolute: true},
                    (err, files) =>
                    {
                        if (err)
                        {
                            return reject(err);
                        }

                        resolve(files);
                    }
                )
            }
        );
    }


    /**
     * Reads the file
     *
     * @private
     * @param {string} file
     * @return {Promise}
     */
    readFile (file)
    {
        return new Promise(
            (resolve, reject) =>
            {
                fs.readFile(file,
                    (err, data) => {
                        if (err)
                        {
                            return reject(err);
                        }

                        return resolve(data.toString());
                    }
                )
            }
        );
    }


    /**
     * Compiles the given file
     *
     * @private
     * @param {string} file
     * @param {string} fileContent
     * @param {bool} debug
     */
    compileFile (file, fileContent, debug)
    {
        const lessOptions = {
            paths: [path.dirname(file)],
            filename: path.basename(file),
            plugins: [
                new LessPluginAutoPrefixer({
                    browsers: this.config.browsers,
                }),
            ],
        };

        if (debug)
        {
            lessOptions.sourceMap = {
                sourceMapFileInline: true,
            };
        }

        return new Promise(
            (resolve, reject) =>
            {
                less.render(fileContent, lessOptions)
                    .then(
                        (output) => {
                            resolve(output.css);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
            }
        );
    }




    /**
     * Minifies the given CSS
     *
     * @private
     * @param {string} css
     * @returns {Promise}
     */
    minify (css)
    {
        return csso.minify(css).css;
    }



    /**
     * Writes the compiled file
     *
     * @private
     * @param {string} file
     * @param {string} content
     */
    writeFile (file, content)
    {
        const outFile = this.generateOutputFileName(file);

        this.logger.log(`Compile ${chalk.yellow(path.basename(file))} -> ${chalk.yellow(path.basename(outFile))}`);

        fs.mkdirsSync(path.dirname(outFile));

        return new Promise(
            (resolve, reject) => {
                fs.writeFile(outFile, content,
                    (err) => {
                        if (err)
                        {
                            return reject(err);
                        }

                        resolve();
                    }
                );
            }
        );
    }


    /**
     * Generates the output file name
     *
     * @private
     * @param {string} file
     * @returns {string}
     */
    generateOutputFileName (file)
    {
        let relativeSrcPath = path.relative(this.directory, file);

        // join output dir + relative src dir + file name (with extension switched to css)
        return path.join(
            path.resolve(
                this.directory,
                this.config.output
            ),
            path.dirname(relativeSrcPath),
            path.basename(file, ".less") + ".css"
        );
    }
};
