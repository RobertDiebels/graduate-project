/**
 * Created by Robert on 11-7-2017.
 */

const shell = require('shelljs');
const CLICommand = require('../../commands/command');
class BurrowGenerator extends CLICommand {
    constructor(amountOfNodes) {
        super();
        this._type = "burrow";
    }

    generate(amountOfNodes) {
        console.info("Starting burrow config generation...");
        this._amountOfNodes = amountOfNodes;
        this._checkDependencies(['kubectl', 'monax'])
        this._getSeedIpsFromCluster();
    }

    _checkDependencies(dependencies) {
        console.info("Checking dependecies...");
        dependencies.forEach(function (dependency) {
            if (!shell.which(dependency)) {
                console.error('Unable to find "%s", please check if it was installed correctly.', dependency);
                process.exit(1);
            }
        });
        console.info("Dependencies are ok!");
    }

    _getSeedIpsFromCluster() {
        const self = this;
        console.info("Gettting IP-adresses from cluster...");
        shell.exec("kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="+'\\"ExternalIP\\"'+ ")].address}'",
            function (code, stdout, stderr) {
                self.handleShellExecCommand(code, stdout, stderr, function () {
                    console.info("\nSuccessfully extracted IP-addresses...");
                    self._ipAddresses = stdout.split(' ');
                    self._makeChain();
                })
            });


    }

    equalsChainType(type) {
        return type.toLocaleLowerCase() === this._type.toLocaleLowerCase();
    }

    _makeChain() {
        console.info("Initializing chain...");
        console.info("Setting flags...");
        const flags = this._createAccountTypesOption() + ' ' + this._createIPSeedsOption();
        console.info("Flags:", flags);
        // shell.exec('monax chains make experiment ' + flags);
    }

    _createAccountTypesOption() {
        return '--account-types=Full:1,Validator:' + (this._amountOfNodes - 1);
    }

    _createIPSeedsOption() {
        let option = '--seeds-ip=';
        const ipAddressesWithPort = this.getIPAddrressesWithPort();
        option += ipAddressesWithPort.toString();
        return option;
    }

    getIPAddrressesWithPort() {
        let ipAddressesWithPort = [];
        this._ipAddresses.forEach(function (ipAddress) {
            ipAddress = ipAddress.replace("'", "");
            ipAddressesWithPort.push(ipAddress + ':46656');
        });
        return ipAddressesWithPort;
    }
}

module.exports = BurrowGenerator;