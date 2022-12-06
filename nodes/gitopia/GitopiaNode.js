const homedir = require('os').homedir();
const fs = require("fs");
const appRoot = require('app-root-path');
const shell = require("shelljs");
const NodeInstaller = require("../NodeInstaller");

class GitopiaNode {
    constructor(moniker, wallet, password) {
        this.moniker = moniker;
        this.wallet = wallet;
        this.password = password;
        this.nodeInstaller = new NodeInstaller();
    }

    info() {
        const status = this.status();
        const addressWallet = this.existWallet() ? this.getWallet() : 'not created';
        const addressValoper = this.existWallet() ? this.getValoper() : 'not created';
        const latestBlock = status ? status.SyncInfo.latest_block_height : 'error';
        const isSync = status ? (!status.SyncInfo.catching_up) : false;
        const rpc = status ? status.NodeInfo.other.rpc_address : 'error';
        const peer = status ? status.NodeInfo.id + '@' +
            status.NodeInfo.listen_addr.replace('tcp://', '').replace('http://', '')
            : 'error';

        return {
            addressWallet: addressWallet,
            addressValoper: addressValoper,
            latestBlock: latestBlock,
            isSync: isSync,
            rpc: rpc,
            peer: peer
        }
    }

    exist() {
        return fs.existsSync(homedir + "/.gitopia");
    }

    existWallet() {
        return shell.exec(`source $HOME/.bash_profile && gitopiad keys show ${this.wallet}`, {shell: '/bin/bash', silent: true}).code === 0;
    }

    getWallet() {
        return shell.exec(`source $HOME/.bash_profile && gitopiad keys show ${this.wallet} -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    getValoper() {
        return shell.exec(`source $HOME/.bash_profile && gitopiad keys show ${this.wallet} --bech val -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    createWallet() {
        shell.exec(`mkdir -p $HOME/stakeme-files`)
        const resultCreateWallet = shell.exec(`source $HOME/.bash_profile && gitopiad keys add ${this.wallet}`, {shell: '/bin/bash', silent: true });
        const walletData = resultCreateWallet.stdout + resultCreateWallet.stderr;
        shell.exec(`echo "${walletData}" | tee -a $HOME/stakeme-files/gitopia-wallet.txt`, {shell: '/bin/bash', silent: true });
        return 'The wallet has been created and the data is saved on your server.\n' +
               'View mnemonic: cat $HOME/stakeme-files/gitopia-wallet.txt\n';
    }

    existValidator() {
        const resultExist = shell.exec(`source $HOME/.bash_profile && gitopiad q staking validator $(gitopiad keys show ${this.wallet} --bech val -a)`, {shell: '/bin/bash'});
        return resultExist.code === 0;
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

    async install() {
        this.nodeInstaller.run('source $HOME/.bash_profile && STAKEME_MONIKER=${this.moniker} bash ${appRoot}/scripts/gitopia-installer.sh');
        return "Install service go..";
    }

    async restart() {
        console.log('[Core]',
            shell.exec('source $HOME/.bash_profile && sudo systemctl restart gitopiad', {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been restarted";
    }

    async stop() {
        console.log('[Core]',
            shell.exec('source $HOME/.bash_profile && sudo systemctl stop gitopiad', {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been stopped";
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

    status() {
        try {
            const status = shell.exec('source $HOME/.bash_profile && gitopiad status', {silent: true, shell: '/bin/bash'});
            return JSON.parse(status.stdout.trim() + status.stderr.trim());
        } catch (e) {
            console.log(e);
            return undefined;
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
        return 'Discord faucet: https://discord.gg/WujRarhaFV';
    }

    logs() {
        try {
            return shell.exec('source $HOME/.bash_profile && sudo journalctl -u gitopiad -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"', {silent: true, shell: '/bin/bash'}).stdout;
        } catch (e) {
            console.log(e);
            return 'Error get logs';
        }
    }
}

module.exports = GitopiaNode