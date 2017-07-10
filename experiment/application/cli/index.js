#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const shelljs = require('shelljs');
const util = require('util');

program
    .version('0.1.0');

program.command('versions')
    .action(function(){
        checkDependencies(['kubectl', 'terraform']);
        console.info("You've installed the following versions:");
        console.info("----Kubectl version----");
        shelljs.exec('kubectl version');
        console.info("----Terraform version----");
        shelljs.exec('terraform --version');
    });

program.command('launch')
    .option('-n, --nodes <nodes>', "The amount of nodes in the cluster. Defaults to '4'", parseInt)
    .option('-p, --prefix <prefix>', "The prefix for the cluster domain. Defaults to [x]nodes, where x is the amount of nodes from the nodes option, e.g. '4nodes'.")
    .option('--dns <dns>', "The full dns name. For example: subdomain.example.com. Defaults to: graduate-project.robertdiebels.com")
    .option('-d, --dashboard <dash>', "Add a kubernetes dashboard, defaults to: 'true'")
    .option('-t, --terraformdir <terraformdir>', "The terraform configuration directory. This needs to be a full path so, 'Drive:\\*\\yourDir'.")
    .action(function (options) {
        checkDependencies(['kubectl', 'terraform']);
        launch(options);
    });

function launch(options) {
    const nodes = options.nodes || 4;
    const prefix = options.prefix || 'nodes';
    const dns = options.dns || "graduate-project.robertdiebels.com";
    const terraformDirectory = options.terraformdir;
    console.info("tfdir", options.terraformdir, terraformDirectory);
    setClusterContext(nodes, prefix, dns);
    launchCluster(terraformDirectory);
}

function setClusterContext(nodes, prefix, dns) {
    const context = util.format('%s%s.%s', nodes, prefix, dns);
    console.info("Setting kubectl cluster context to ", context);
    const useContextCommand = 'kubectl config use-context ' + context;
    shelljs.exec(useContextCommand, function (code, stdout, stderr) {
        handleShellExecCommand(code, stdout, stderr, function () {
            useContextSucces(context)
        })
    });

}

function useContextSucces(context) {
    console.info("Successfully set use-context to ", context);
}

function launchCluster(terraformDirectory) {
    console.info("Launching cluster to aws...");
    console.info("Planning..")
    console.info("CD to ", terraformDirectory);
    shelljs.cd(terraformDirectory);
    executeTerraformPlan();
    executeTerraformApply();
    addKubernetesDashboard();
    addDashboardProxy();
}

function executeTerraformPlan() {
    shelljs.exec('terraform plan', function (code, stdout, stderr) {
        handleShellExecCommand(code, stdout, stderr, function () {
            terraformPlanSucces()
        })
    });
}

function terraformPlanSucces() {
    console.info("Successfully planned cluster!");
};

function executeTerraformApply() {
    shelljs.exec('terraform apply', function (code, stdout, stderr) {
        handleShellExecCommand(code, stdout, stderr, function () {
            terraformApplySucces()
        })
    });
}

function terraformApplySucces(){
    console.info("Successfully started cluster!");
}

function addKubernetesDashboard() {
    console.info('Adding kubernetes dashboard after waiting 60 seconds..');
    shelljs.exec('kubectl create -f https://git.io/kube-dashboard', function (code, stdout, stderr) {
        handleShellExecCommand(code, stdout, stderr, function () {
            console.info("Succesfully added dasboard!");
        })
    });
}
function addDashboardProxy(){
    console.info('Proxing dashboard to localhost..');
    shelljs.exec('kubectl proxy', function (code, stdout, stderr) {
        handleShellExecCommand(code, stdout, stderr, function () {
            console.info("Dasboard now available on localhost:8081/ui");
        })
    });
}

program.command('generate')
    .option('--chain <chain>', "Which chain to generate config for.")
    .option('-n, --nodes <nodes>', "The amount of nodes in the cluster.", parseInt)
    .action(function (options) {
        console.log('Generating config for "%s" %s nodes', options.nodes, options.chain);
        checkDependencies(['kubectl']);
    });


function handleShellExecCommand(code, stderr, stdout, sucessCallBack) {
    if (isExecError(code)) {
        console.error("Error: ", stderr);
    }
    else {
        sucessCallBack();
    }
}

function isExecError(code) {
    return code !== 0;
}

function checkDependencies(dependencies) {
    console.info("Checking dependecies...");

    dependencies.forEach(function (dependency) {
        if (!shelljs.which(dependency)) {
            console.error('Unable to find "%s", please check if it was installed correctly.', dependency);
            process.exit(1);
        }
    });
    console.info("Dependencies are ok!");
}

program.parse(process.argv);