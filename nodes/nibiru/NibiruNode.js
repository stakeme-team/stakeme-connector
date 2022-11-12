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
        return shell.exec(`nibid keys show ${this.wallet}`, {silent: true}).code === 0;
    }

    getWallet() {
        return shell.exec(`nibid keys show ${this.wallet} -a`, {silent: true}).stdout;
    }

    getValoper() {
        return shell.exec(`nibid keys show ${this.wallet} --bech val -a`, {silent: true}).stdout;
    }

    createWallet() {
        shell.exec(`mkdir -p $HOME/stakeme-files`)
        const resultCreateWallet = shell.exec(`nibid keys add ${this.wallet}`, { silent: true });
        const walletData = resultCreateWallet.stdout + resultCreateWallet.stderr;
        shell.exec(`echo "${walletData}" | tee -a $HOME/stakeme-files/nibiru-wallet.txt`, { silent: true });
        return 'The wallet has been created and the data is saved on your server.\n' +
               'View mnemonic: cat $HOME/stakeme-files/nibiru-wallet.txt\n';
    }

    existValidator() {
        const resultExist = shell.exec(`nibid q staking validator $(nibid keys show ${this.wallet} --bech val -a)`);
        return resultExist.code === 0;
    }

    createValidator(moniker, details, identify) {
        let command = 'nibid tx staking create-validator ' +
        '--amount=1000000nibid ' +
        '--pubkey=$(nibid tendermint show-validator) ' +
        '--chain-id=nibiru-testnet-1 ' +
        '--commission-rate=0.10 ' +
        '--commission-max-rate=0.20 ' +
        '--commission-max-change-rate=0.01 ' +
        '--min-self-delegation=1 ' +
        '--gas-prices=0.1nibid ' +
        '--gas-adjustment=1.5 ' +
        '--gas=auto '
        command += `--moniker=${moniker} `;
        command += `--details=${details} `;
        if (identify !== '-') {
            command += `--identity=${identify} `;
        }
        command += `--from=${this.wallet} `;
        command += '-y'
        const resultCreate = shell.exec(command);
        return resultCreate.stdout + resultCreate.stderr;
    }

    async install() {
        console.log('[Core]',
            shell.exec(`STAKEME_MONIKER=${this.moniker} bash ${appRoot}/nodes/nibiru/nibiru-installer.sh`,
                {silent: true}
            ).stdout.trim()
        );
        return "Node has been installed.";
    }

    async restart() {
        console.log('[Core]',
            shell.exec('sudo systemctl restart nibid', {silent: true}).stdout.trim()
        );
        return "Node has been restarted";
    }

    async stop() {
        console.log('[Core]',
            shell.exec('sudo systemctl stop nibid', {silent: true}).stdout.trim()
        );
        return "Node has been stopped";
    }

    async delete() {
        try {
            const command = 'sudo systemctl stop nibid &&' +
                'sudo systemctl disable nibid && ' +
                'sudo rm /etc/systemd/system/nibid.service && ' +
                'sudo systemctl daemon-reload && ' +
                'cd $HOME && ' +
                'rm -rf .nibid nibiru && ' +
                'sudo rm $(which nibid)';
            shell.exec(command, {silent: true}).stdout.trim();
            return "Success delete node";
        } catch (e) {
            console.log(e);
            return "Error delete node";
        }
    }

    status() {
        try {
            const status = shell.exec('nibid status', {silent: true}).stdout.trim();
            return JSON.parse(status);
        } catch (e) {
            console.log(e);
            return undefined;
        }
        // try {
        //     const logs = shell.exec('sudo journalctl -u nibid -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"', {silent: true}).stdout;
        //     const status = shell.exec('nibid status', {silent: true}).stdout.trim();
        //     const statusObj = JSON.parse(status);
        //     const statusTemplate = `RPC Address: ${statusObj.NodeInfo.other.rpc_address}\n` +
        //         `Latest block: ${statusObj.SyncInfo.latest_block_height}\n` +
        //         `Is sync: ${(!statusObj.SyncInfo.catching_up)}`;
        //     return `🔵️ Logs:\n${logs}\n` +
        //         `🔵️ Status:\n${statusTemplate}`;
        // } catch (e) {
        //     console.log(e);
        //     return 'Error get status';
        // }
    }
}

module.exports = NibiruNode