
const fs = require("fs");
const appRoot = require('app-root-path');
const shell = require("shelljs");
const CosmosNode = require("../CosmosNode");

class Okp4Node extends CosmosNode {
    install() {
        this.nodeInstaller.run(`source $HOME/.bash_profile && STAKEME_MONIKER=${this.moniker} bash ${appRoot}/scripts/okp4-installer.sh`);
        return "Install service go..";
    }

    createValidator(moniker, details, identify) {
        let command = 'source $HOME/.bash_profile && okp4d tx staking create-validator ' +
        '--amount=1000000uknow ' +
        '--pubkey=$(okp4d tendermint show-validator) ' +
        '--chain-id=okp4-nemeton-1 ' +
        '--commission-rate=0.10 ' +
        '--commission-max-rate=0.20 ' +
        '--commission-max-change-rate=0.01 ' +
        '--min-self-delegation=1 ' +
        '--gas-prices=0.1uknow ' +
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
        const nameSecretFolder = '.okp4d';
        const binaryFolder = 'okp4d';
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
        const command = `source $HOME/.bash_profile && okp4d tx bank send ${this.wallet} ${toWallet} ${amount}uknow --from ${this.wallet} --chain-id okp4-nemeton-1 --gas-prices 0.1uknow --gas-adjustment 1.5 --gas auto -y`;
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
        const command = `source $HOME/.bash_profile && okp4d tx staking delegate ${toValoper} ${amount}uknow --from ${this.wallet} --chain-id okp4-nemeton-1 --gas-prices 0.1uknow --gas-adjustment 1.5 --gas auto -y `;
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
        return 'Discord faucet: https://discord.gg/okp4';
    }
}

module.exports = Okp4Node