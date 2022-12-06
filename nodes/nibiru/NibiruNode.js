
const fs = require("fs");
const appRoot = require('app-root-path');
const shell = require("shelljs");
const CosmosNode = require("../CosmosNode");

class NibiruNode extends CosmosNode {
    install() {
        this.nodeInstaller.run(`source $HOME/.bash_profile && STAKEME_MONIKER=${this.moniker} bash ${appRoot}/scripts/nibiru-installer.sh`);
        return "Install service go..";
    }

    createValidator(moniker, details, identify) {
        let command = 'source $HOME/.bash_profile && nibid tx staking create-validator ' +
        '--amount=1000000unibi ' +
        '--pubkey=$(nibid tendermint show-validator) ' +
        '--chain-id=nibiru-testnet-1 ' +
        '--commission-rate=0.10 ' +
        '--commission-max-rate=0.20 ' +
        '--commission-max-change-rate=0.01 ' +
        '--min-self-delegation=1 ' +
        '--gas-prices=0.1unibi ' +
        '--gas-adjustment=1.5 ' +
        '--gas=auto '
        command += `--moniker=${moniker} `;
        command += `--details=${details} `;
        if (identify !== '-') {
            command += `--identity=${identify} `;
        }
        command += `--from=${this.wallet} `;
        command += '-y'
        const resultCreate = shell.exec(command, {shell: '/bin/bash'});
        return (resultCreate.stdout + resultCreate.stderr);
    }

    delete() {
        const nameSecretFolder = '.nibid';
        const binaryFolder = 'nibiru';
        try {
            const command = 'source $HOME/.bash_profile && sudo systemctl stop '+ this.binaryCmd + ' && ' +
                'sudo systemctl disable ' + this.binaryCmd + ' && ' +
                'sudo rm /etc/systemd/system/' + this.binaryCmd + '.service && ' +
                'sudo systemctl daemon-reload && ' +
                'cd $HOME && ' +
                'rm -rf ' + nameSecretFolder + ' && ' +
                'rm -rf ' + binaryFolder + ' && ' +
                'sudo rm $(which ' + this.binaryCmd +')';
            shell.exec(command, {shell: '/bin/bash'});
            this.nodeInstaller.setStatus('not installing');
            return "Success delete node";
        } catch (e) {
            console.log(e);
            return "Error delete node";
        }
    }

    sendTokens(toWallet, amount) {
        const command = `source $HOME/.bash_profile && nibid tx bank send ${this.wallet} ${toWallet} ${amount}unibi --from ${this.wallet} --chain-id nibiru-testnet-1 --gas-prices 0.1unibi --gas-adjustment 1.5 --gas auto -y`;
        console.log('send', command);
        try {
            const result = shell.exec(command, {silent: true, shell: '/bin/bash'});
            return result.stdout + result.stderr;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    delegateTokens(toValoper, amount) {
        const command = `source $HOME/.bash_profile && nibid tx staking delegate ${toValoper} ${amount}unibi --from ${this.wallet} --chain-id nibiru-testnet-1 --gas-prices 0.1unibi --gas-adjustment 1.5 --gas auto -y `;
        console.log('delegate', command);
        try {
            const result = shell.exec(command, {silent: true, shell: '/bin/bash'});
            return result.stdout + result.stderr;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    faucet() {
        return 'Discord faucet: https://discord.gg/nZCRDqYfJJ';
    }
}

module.exports = NibiruNode