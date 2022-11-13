const homedir = require('os').homedir();
const fs = require("fs");
const appRoot = require('app-root-path');
const shell = require("shelljs");

class NibiruNode {
    constructor(moniker, wallet, password) {
        this.moniker = moniker;
        this.wallet = wallet;
        this.password = password;
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
        return fs.existsSync(homedir + "/.nibid");
    }

    existWallet() {
        return shell.exec(`source $HOME/.bash_profile && nibid keys show ${this.wallet}`, {shell: '/bin/bash', silent: true}).code === 0;
    }

    getWallet() {
        return shell.exec(`source $HOME/.bash_profile && nibid keys show ${this.wallet} -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    getValoper() {
        return shell.exec(`source $HOME/.bash_profile && nibid keys show ${this.wallet} --bech val -a`, {shell: '/bin/bash', silent: true}).stdout;
    }

    createWallet() {
        shell.exec(`mkdir -p $HOME/stakeme-files`)
        const resultCreateWallet = shell.exec(`source $HOME/.bash_profile && nibid keys add ${this.wallet}`, {shell: '/bin/bash', silent: true });
        const walletData = resultCreateWallet.stdout + resultCreateWallet.stderr;
        shell.exec(`echo "${walletData}" | tee -a $HOME/stakeme-files/nibiru-wallet.txt`, {shell: '/bin/bash', silent: true });
        return 'The wallet has been created and the data is saved on your server.\n' +
               'View mnemonic: cat $HOME/stakeme-files/nibiru-wallet.txt\n';
    }

    existValidator() {
        const resultExist = shell.exec(`source $HOME/.bash_profile && nibid q staking validator $(nibid keys show ${this.wallet} --bech val -a)`, {shell: '/bin/bash'});
        return resultExist.code === 0;
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

    async install() {
        console.log('[Core]',
            shell.exec(`source $HOME/.bash_profile && STAKEME_MONIKER=${this.moniker} bash ${appRoot}/nodes/nibiru/nibiru-installer.sh`,
                {silent: true, shell: '/bin/bash'}
            ).stdout.trim()
        );
        return "Node has been installed.";
    }

    async restart() {
        console.log('[Core]',
            shell.exec('source $HOME/.bash_profile && sudo systemctl restart nibid', {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been restarted";
    }

    async stop() {
        console.log('[Core]',
            shell.exec('source $HOME/.bash_profile && sudo systemctl stop nibid', {silent: true, shell: '/bin/bash'}).stdout.trim()
        );
        return "Node has been stopped";
    }

    async delete() {
        try {
            const command = 'source $HOME/.bash_profile && sudo systemctl stop nibid && ' +
                'sudo systemctl disable nibid && ' +
                'sudo rm /etc/systemd/system/nibid.service && ' +
                'sudo systemctl daemon-reload && ' +
                'cd $HOME && ' +
                'rm -rf .nibid && ' +
                'rm -rf nibiru && ' +
                'sudo rm $(which nibid)';
            console.log(shell.exec(command, {shell: '/bin/bash'}));
            return "Success delete node";
        } catch (e) {
            console.log(e);
            return "Error delete node";
        }
    }

    status() {
        try {
            const status = shell.exec('source $HOME/.bash_profile && nibid status', {silent: true, shell: '/bin/bash'}).stdout.trim();
            return JSON.parse(status);
        } catch (e) {
            console.log(e);
            return undefined;
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

    logs() {
        try {
            return shell.exec('source $HOME/.bash_profile && sudo journalctl -u nibid -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"', {silent: true, shell: '/bin/bash'}).stdout;
        } catch (e) {
            console.log(e);
            return 'Error get logs';
        }
    }
}

module.exports = NibiruNode