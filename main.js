/**
 * @typedef {{
 *      input: string,
 *      output: string,
 *      browsers: string[],
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
    });

    // build internal config
    config.input = config.input.replace(/\/+$/, "") + "/";

    return function (done, debug)
    {
        let task = new LessTask(config);
        task.run(done, debug);
    };
};
