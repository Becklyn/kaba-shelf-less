const chalk = require("chalk");
const chokidar = require("chokidar");
const glob = require("glob");
const less = require("less");
const LessDirectoryTask = require("./less-directory-task");
const Logger = require("../lib/logger");
const Promise = require("bluebird");

/**
 * The main LESS task handler
 *
 * @type {LessTask}
 */
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
         * @type {LessTaskConfig}
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
     */
    run (done)
    {
        this.buildTaskList()
            .then(
                /** @param {LessDirectoryTask[]} directoryTasks */
                (directoryTasks) =>
                {
                    const compileResult = this.runAllTasks(directoryTasks);

                    if (this.config.watch)
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
            .on("add", () => this.runAllTasks(directoryTasks))
            .on("change", () => this.runAllTasks(directoryTasks));
    }



    /**
     * Runs all tasks
     *
     * @private
     * @param {LessDirectoryTask[]} tasks
     * @returns {Promise}
     */
    runAllTasks (tasks)
    {
        return Promise.all(
            tasks.map(task => task.compile())
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
