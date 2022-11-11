const homedir = require('os').homedir();
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const appRoot = require('app-root-path');

class NibiruNode {
    constructor(moniker, wallet, password) {
        this.moniker = moniker;
        this.wallet = wallet;
        this.password = password;
    }

    exist() {
        return fs.existsSync(homedir + "/.nibid");
    }

    async install() {
        console.log('[Core]', (
                await execAsync(`STAKEME_MONIKER=${this.moniker} bash ${appRoot}/nodes/nibiru/nibiru-installer.sh`)
            ).stdout
        );
        return "Node has been installed.";
    }

    async restart() {
        console.log('[Core]', (
                await execAsync(`sudo systemctl restart nibid`)
            ).stdout
        );
        return "Node has been restarted";
    }

    async stop() {
        console.log('[Core]', (
                await execAsync(`sudo systemctl stop nibid`)
            ).stdout
        );
        return "Node has been stopped";
    }

    async delete() {
        try {
            await execAsync('sudo systemctl stop nibid &&' +
                'sudo systemctl disable nibid && ' +
                'sudo rm /etc/systemd/system/nibid.service && ' +
                'sudo systemctl daemon-reload && ' +
                'cd $HOME && ' +
                'rm -rf .nibid nibiru && ' +
                'sudo rm $(which nibid)');
            return "Success delete node";
        } catch (e) {
            console.log(e);
            return "Error delete node";
        }
    }

    async status() {
        try {
            const logs = (await execAsync('sudo journalctl -u nibid -n 5 -o cat | sed -r "s/\x1B\\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"')).stdout;
            const status = (await execAsync(
                    '/usr/bin/bash -c "nibid status"')
            ).stdout.trim();
            const statusObj = JSON.parse(status);
            const statusTemplate = `RPC Address: ${statusObj.NodeInfo.other.rpc_address}\n` +
                `Latest block: ${statusObj.SyncInfo.latest_block_height}\n` +
                `Is sync: ${(!statusObj.SyncInfo.catching_up)}`;
            return `🔵️ Logs:\n${logs}\n` +
                `🔵️ Status:\n${statusTemplate}`;
        } catch (e) {
            console.log(e);
            return 'Error get status';
        }

    }
}

module.exports = NibiruNode