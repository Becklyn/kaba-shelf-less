/**
 * @typedef {{
 *      input: string,
 *      output: string,
 *      browsers: string[],
 *      outputFileName: function(string, string):string,
 *      debug: boolean,
 *      watch: boolean,
 * }} LessTaskConfig
 */

const _ = require("lodash");
const LessTask = require("./task/less-task");

module.exports = function (config = {})
{
    config = _.defaultsDeep(config, {
        // input directory (can be a glob to multiple directories)
        input: "src/**/Resources/assets/less/",
        // output directory (relative to input directory)
        output: "../../public/css",
        // browsers to support
        browsers: ["last 2 versions", "IE 10"],
        // Transforms the file name before writing the out file
        outputFileName: (outputFileName, inputFileName) => outputFileName,
        // Whether to build for debug
        debug: null,
        // Whether to start the watcher
        watch: null,
    });

    // build internal config
    config.input = config.input.replace(/\/+$/, "") + "/";

    return function (done, debug)
    {
        if (null === config.debug)
        {
            config.debug = debug;
        }

        if (null === config.watch)
        {
            config.watch = debug;
        }

        let task = new LessTask(config);
        task.run(done);
    };
};
