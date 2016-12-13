const chalk = require("chalk");
const chokidar = require("chokidar");
const glob = require("glob");
const less = require("less");
const LessDirectoryTask = require("./less-directory-task");
const Logger = require("../lib/logger");
const Promise = require("bluebird");


module.exports = class LessTask
{
    /**
     *
     * @param {LessTaskConfig} config
     */
    constructor (config)
    {
        /**
         * @private
         * @type {ScssTaskConfig}
         */
        this.config = config;

        /**
         * @private
         * @type {Logger}
         */
        this.logger = new Logger("LESS", "blue", "");


        // register less logger
        less.logger.addListener({
            warn: (msg) => this.logger.log(chalk.yellow(msg)),
            error: (msg) => this.logger.log(chalk.red(msg)),
        });
    }


    /**
     * Runs the task
     *
     * @param {function} done
     * @param {boolean} debug Flag, whether the task should run in debug mode
     */
    run (done, debug)
    {
        this.buildTaskList()
            .then(
                /** @param {LessDirectoryTask[]} directoryTasks */
                (directoryTasks) =>
                {
                    const compileResult = this.runAllTasks(directoryTasks, debug);

                    if (debug)
                    {
                        const watcher = this.watch(directoryTasks);

                        process.on("SIGINT",
                            () => {
                                watcher.close();
                                done();
                            }
                        );
                    }
                    else
                    {
                        compileResult.then(done);
                    }
                },
                (error) => {
                    console.log(error);
                    done();
                }
            );
    }

    /**
     * Starts the watcher
     *
     * @private
     * @param {LessDirectoryTask[]} directoryTasks
     */
    watch (directoryTasks)
    {
        this.logger.log(`Started watching ${chalk.yellow(this.config.input)}`);

        return chokidar.watch(`${this.config.input}**/*.less`, {
            ignoreInitial: true,
        })
            .on("add", () => this.runAllTasks(directoryTasks, true))
            .on("change", () => this.runAllTasks(directoryTasks, true));
    }



    /**
     * Runs all tasks
     *
     * @private
     * @param {LessDirectoryTask[]} tasks
     * @param {boolean} debug
     * @returns {Promise}
     */
    runAllTasks (tasks, debug)
    {
        return Promise.all(
            tasks.map(task => task.compile(debug))
        );
    }



    /**
     * Builds the task list
     *
     * @private
     */
    buildTaskList ()
    {
        return new Promise(
            (resolve, reject) => {
                glob(this.config.input, {absolute: true},
                    (err, directories) =>
                    {
                        if (err)
                        {
                            return reject(err);
                        }

                        const tasks = directories.map(
                            (dir) => new LessDirectoryTask(dir, this.config)
                        );

                        resolve(tasks);
                    }
                )
            }
        );
    }
};
