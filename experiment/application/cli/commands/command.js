/**
 * Created by Robert on 11-7-2017.
 */
const shell = require('shelljs');

class CLICommand {
    handleShellExecCommand(code, stdout, stderr, sucessCallBack) {
        if (CLICommand.isExecError(code)) {
            console.error("Error: ", stderr);
        }
        else {
            sucessCallBack();
        }
    }

    static isExecError(code) {
        return code !== 0;
    }

    checkDependencies(dependencies) {
        console.info("Checking dependecies...");
        dependencies.forEach(function (dependency) {
            if (!shell.which(dependency)) {
                console.error('Unable to find "%s", please check if it was installed correctly.', dependency);
                process.exit(1);
            }
        });
        console.info("Dependencies are ok!");
    }
}

module.exports = CLICommand;