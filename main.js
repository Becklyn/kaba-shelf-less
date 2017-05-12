/**
 * @typedef {{
 *      input: string,
 *      output: string,
 *      browsers: string[],
 *      outputFileName: function(string, string):string,
 *      debug: boolean,
 *      watch: boolean,
 *      verbose: boolean,
 *      lint: boolean,
 * }} LessTaskConfig
 */

const _ = require("lodash");
const LessTask = require("./task/less-task");
const defaultEnvironment = require("kaba/kaba/shelf/app-environment");


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
    });

    // build internal config
    config.input = config.input.replace(/\/+$/, "") + "/";

    return function (done, env)
    {
        config = _.assign({}, defaultEnvironment, env, config);

        let task = new LessTask(config);

        switch (config.mode)
        {
            case "compile":
                task.run(done);
                break;

            default:
                console.log(`Unsupported mode: ${config.mode}`);
                done();
                break;
        }
    };
};
