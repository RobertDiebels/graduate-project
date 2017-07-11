/**
 * Created by Robert on 11-7-2017.
 */
const shelljs = require('shelljs');
const CLICommand = require('./command');
const BurrowGenerator = require('../generate/burrow/generator');

class GenerateCommand extends CLICommand{
    constructor(program){
        super();
        this._program = program;
        this._init();
        this._registerCommand();
    }

    _init(){
        this._generators = [new BurrowGenerator()];
    }

    _registerCommand(){
        const self = this;
        this._program.command('generate <chain>')
            .description("Generate the configuration needed for a chain.")
            .option('-n, --nodes <nodes>', "The amount of nodes in the cluster.", parseInt)
            .action(function (chain, options) {
                console.log('Generating config for "%s" %s nodes', options.nodes, chain);
                self.checkDependencies(['kubectl']);
                self._generate(chain, options);
            });
    }
    _generate(chain, options){
        this._generators.forEach(function(generator){
            if(generator.equalsChainType(chain)){
                generator.generate(options.nodes);
            }
        })
    }
}

module.exports = GenerateCommand;