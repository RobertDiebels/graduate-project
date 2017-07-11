/**
 * Created by Robert on 11-7-2017.
 */
const shelljs = require('shelljs');
const util = require('util');
const CLICommand = require('./command');

class LaunchCommand extends CLICommand{
    constructor(program) {
        super();
        this._program = program;
        this._registerCommand();
    }

    _registerCommand() {
        const self = this;
        this._program.command('launch')
            .description("Launch a cluster based with X amount of nodes from a directory containing terraform configuration.")
            .option('-n, --nodes <nodes>', "The amount of nodes in the cluster. Defaults to '4'", parseInt)
            .option('-p, --prefix <prefix>', "The prefix for the cluster domain. Defaults to [x]nodes, where x is the amount of nodes from the nodes option, e.g. '4nodes'.")
            .option('--dns <dns>', "The full dns name. For example: subdomain.example.com. Defaults to: graduate-project.robertdiebels.com")
            .option('-d, --dashboard <dash>', "Add a kubernetes dashboard, defaults to: 'true'")
            .option('-t, --terraformdir <terraformdir>', "The terraform configuration directory. This needs to be a full path so, 'Drive:\\*\\yourDir'.")
            .action(function (options) {
                self.checkDependencies(['kubectl', 'terraform']);
                self.launch(options);
            });
    }


    launch(options) {
        const nodes = options.nodes || 4;
        const prefix = options.prefix || 'nodes';
        const dns = options.dns || "graduate-project.robertdiebels.com";
        const terraformDirectory = options.terraformdir;
        console.info("tfdir", options.terraformdir, terraformDirectory);
        this.setClusterContext(nodes, prefix, dns);
        this.launchCluster(terraformDirectory);
    }

    setClusterContext(nodes, prefix, dns) {
        const self = this;
        const context = util.format('%s%s.%s', nodes, prefix, dns);
        console.info("Setting kubectl cluster context to ", context);
        const useContextCommand = 'kubectl config use-context ' + context;
        shelljs.exec(useContextCommand, function (code, stdout, stderr) {
            self.handleShellExecCommand(code, stdout, stderr, function () {
                self.useContextSucces(context)
            })
        });

    }

    useContextSucces(context) {
        console.info("Successfully set use-context to ", context);
    }

    launchCluster(terraformDirectory) {
        console.info("Launching cluster to aws...");
        console.info("Planning..");
        console.info("CD to ", terraformDirectory);
        shelljs.cd(terraformDirectory);
        this.executeTerraformPlan();
        this.executeTerraformApply();
        // this.addKubernetesDashboard();
        // this.addDashboardProxy();
    }

    executeTerraformPlan() {
        const self = this;
        shelljs.exec('terraform plan', function (code, stdout, stderr) {
            self.handleShellExecCommand(code, stdout, stderr, function () {
                self.terraformPlanSucces()
            })
        });
    }

    terraformPlanSucces() {
        console.info("Successfully planned cluster!");
    };


    executeTerraformApply() {
        const self = this;
        shelljs.exec('terraform apply', function (code, stdout, stderr) {
            self.handleShellExecCommand(code, stdout, stderr, function () {
                self.terraformApplySucces();
            })
        });
    }

    terraformApplySucces() {
        console.info("Successfully started cluster!");
    }

    addKubernetesDashboard() {
        const self = this;
        console.info('Adding kubernetes dashboard after waiting 60 seconds..');
        shelljs.exec('kubectl create -f https://git.io/kube-dashboard', function (code, stdout, stderr) {
            self.handleShellExecCommand(code, stdout, stderr, function () {
                console.info("Succesfully added dasboard!");
            })
        });
    }

    addDashboardProxy() {
        const self = this;
        console.info('Proxing dashboard to localhost..');
        shelljs.exec('kubectl proxy', function (code, stdout, stderr) {
            self.handleShellExecCommand(code, stdout, stderr, function () {
                console.info("Dasboard now available on localhost:8081/ui");
            })
        });
    }
}

module.exports = LaunchCommand;