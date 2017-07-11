/**
 * Created by Robert on 11-7-2017.
 */
const shelljs = require('shelljs');
const CLICommand = require('./command');

//TODO: Rename to DependenciesCommand
class VersionsCommand extends CLICommand {
    constructor(program) {
        super();
        this._program = program;
        this._registerCommand();
    }

    _registerCommand() {
        const self = this;
        this._program.command('versions')
            .description("Show versions of cli dependencies.")
            .option('-u, --used', "The versions of dependencies during the experiment.")
            .action(function (options) {
                if (options.used) {
                    self._showUsedVersions();
                }
                else {
                    self.checkDependencies(['kubectl', 'terraform']);
                    self._showCurrentVersions();
                }
            });
    }

    _showUsedVersions() {
        console.info("Kops:      1.6.2 (git-98ae12a)");
        console.info("Terraform: 0.9.10");
        console.info("Kubectl:   1.7.0");
        console.info("Monax:     0.17.0 (02a52b9)");
        console.info("NodeJS:    7.5.0");
    }

    _showCurrentVersions() {
        console.info("You've installed the following versions:");
        console.info("----Kubectl version----");
        console.info("Note: Kubectl will try to read the server version as well. This might take a few seconds.");
        shelljs.exec('kubectl version');
        console.info("----Terraform version----");
        shelljs.exec('terraform --version');
        console.info("----Monax version----");
        shelljs.exec('monax version');
        console.info("----NodeJS version----");
        shelljs.exec('node --version');
    }
}

module.exports = VersionsCommand;