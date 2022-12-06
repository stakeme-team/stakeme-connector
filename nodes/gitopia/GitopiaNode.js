const homedir = require('os').homedir();
const fs = require("fs");
const appRoot = require('app-root-path');
const shell = require("shelljs");
const CosmosNode = require("../CosmosNode");

class GitopiaNode extends CosmosNode {
    exist() {
        return fs.existsSync(homedir + "/.gitopia");
    }

    createValidator(moniker, details, identify) {
        let command = 'source $HOME/.bash_profile && gitopiad tx staking create-validator ' +
        '--amount=1000000utlore ' +
        '--pubkey=$(gitopiad tendermint show-validator) ' +
        '--chain-id=gitopia-janus-testnet-2 ' +
        '--commission-rate=0.10 ' +
        '--commission-max-rate=0.20 ' +
        '--commission-max-change-rate=0.01 ' +
        '--min-self-delegation=1 ' +
        '--gas-prices=0.1utlore ' +
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

    install() {
        this.nodeInstaller.run(`source $HOME/.bash_profile && STAKEME_MONIKER=${this.moniker} bash ${appRoot}/scripts/gitopia-installer.sh`);
        return "Install service go..";
    }

    delete() {
        try {
            const command = 'source $HOME/.bash_profile && sudo systemctl stop gitopiad && ' +
                'sudo systemctl disable gitopiad && ' +
                'sudo rm /etc/systemd/system/gitopiad.service && ' +
                'sudo systemctl daemon-reload && ' +
                'cd $HOME && ' +
                'rm -rf .gitopia && ' +
                'rm -rf gitopia && ' +
                'sudo rm $(which gitopiad)';
            shell.exec(command, {shell: '/bin/bash'});
            this.nodeInstaller.setStatus('not installing');
            return "Success delete node";
        } catch (e) {
            console.log(e);
            return "Error delete node";
        }
    }

    sendTokens(toWallet, amount) {
        const command = `source $HOME/.bash_profile && gitopiad tx bank send ${this.wallet} ${toWallet} ${amount}utlore --from ${this.wallet} --chain-id gitopia-janus-testnet-2 --gas-prices 0.1utlore --gas-adjustment 1.5 --gas auto -y`;
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
        const command = `source $HOME/.bash_profile && gitopiad tx staking delegate ${toValoper} ${amount}utlore --from ${this.wallet} --chain-id gitopia-janus-testnet-2 --gas-prices 0.1utlore --gas-adjustment 1.5 --gas auto -y `;
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
        return 'Discord faucet: https://discord.gg/WanKwMZE';
    }
}

module.exports = GitopiaNode