const NodeInstaller = require("./NodeInstaller");
const fs = require("fs");
const homedir = require('os').homedir();
const shell = require("shelljs");

class CosmosNode {
    constructor(moniker, wallet, password, binaryCmd) {
        if (this.constructor.name === 'CosmosNode') {
            throw new Error(`${this.constructor.name}: can not create instance of abstract class`);
        }
        this.moniker = moniker;
        this.wallet = wallet;
        this.password = password;
        this.binaryCmd = binaryCmd;
        this.nodeInstaller = new NodeInstaller();
    }

    install() {}

    getStatusInstall() {
        return this.nodeInstaller.getStatus();
    }

    getInstallLogs() {
        return this.nodeInstaller.getLogs();
    }

    exist() {
        return fs.existsSync(`${homedir}/.${this.binaryCmd}`);
    }

    existWallet() {
        return shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} keys show ${this.wallet}`, {shell: '/bin/bash', silent: true}).code === 0;
    }

    getWallet() {
        return shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} keys show ${this.wallet} -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    getValoper() {
        return shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} keys show ${this.wallet} --bech val -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    createWallet() {
        shell.exec(`mkdir -p $HOME/stakeme-files`)
        const resultCreateWallet = shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} keys add ${this.wallet}`, {shell: '/bin/bash', silent: true });
        const walletData = resultCreateWallet.stdout + resultCreateWallet.stderr;
        shell.exec(`echo "${walletData}" | tee -a $HOME/stakeme-files/${this.binaryCmd}-wallet.txt`, {shell: '/bin/bash', silent: true });
        return 'The wallet has been created and the data is saved on your server.\n' +
            'View mnemonic: cat $HOME/stakeme-files/' + this.binaryCmd + '-wallet.txt\n';
    }

    existValidator() {
        const resultExist = shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} q staking validator $(${this.binaryCmd} keys show ${this.wallet} --bech val -a)`, {shell: '/bin/bash'});
        return resultExist.code === 0;
    }

    restart() {
        console.log('[Core]',
            shell.exec(`source $HOME/.bash_profile && sudo systemctl restart ${this.binaryCmd}`, {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been restarted";
    }

    stop() {
        console.log('[Core]',
            shell.exec(`source $HOME/.bash_profile && sudo systemctl stop ${this.binaryCmd}`, {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been stopped";
    }

    status() {
        try {
            const status = shell.exec(`source $HOME/.bash_profile && ${this.binaryCmd} status`, {silent: true, shell: '/bin/bash'});
            console.log(status);
            return JSON.parse(status.stdout.trim() + status.stderr.trim());
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    logs() {
        try {
            return shell.exec('source $HOME/.bash_profile && sudo journalctl -u ' + this.binaryCmd + ' -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"', {silent: true, shell: '/bin/bash'}).stdout;
        } catch (e) {
            console.log(e);
            return 'Error get logs';
        }
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
            peer: peer,
            'status': status ? 0 : 1
        }
    }

    createValidator(moniker, details, identify) {}

    sendTokens(toWallet, amount) {}

    delegateTokens(toValoper, amount) {}

    faucet() {}

    delete() {}
}

module.exports = CosmosNode;