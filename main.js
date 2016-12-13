/**
 * @typedef {{
 *      input: string,
 *      inputFiles: string,
 *      output: string,
 *      browsers: string[],
 *      ignoreLintFor: Array.<(string|RegExp)>,
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
        // list of file path paths (string or regex). If the file path matches one of these entries, the file won't be linted
        ignoreLintFor: ["/node_modules/", "/vendor/"]
    });

    // build internal config
    config.input = config.input.replace(/\/+$/, "") + "/";

    return function (done, debug)
    {
        let task = new LessTask(config);
        task.run(done, debug);
    };
};
