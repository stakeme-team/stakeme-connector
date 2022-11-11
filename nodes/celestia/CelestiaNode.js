const homedir = require('os').homedir();
const fs = require("fs");
const {exec} = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const appRoot = require('app-root-path');

class CelestiaNode {
    constructor(moniker, wallet, password) {
        this.moniker = moniker;
        this.wallet = wallet;
        this.password = password;
    }

    exist() {
        return fs.existsSync(homedir + "/.celestia-app");
    }

    async install() {
        console.log('[Core]', (
                await execAsync(`STAKEME_MONIKER=${this.moniker} bash ${appRoot}/scripts/celestia-installer.sh`)
            ).stdout
        );
        console.log(`bash ${appRoot}/scripts/celestia-sync.sh`);
        execAsync(`bash ${appRoot}/scripts/celestia-sync.sh`);
        return "Node has been installed. " +
            "Snapshot is now being downloading.\n" +
            "🟠 You should be able to run the node in about 15-30 minutes."
    }

    restart() {

    }

    stop() {

    }

    delete() {

    }

    status() {

    }
}

module.exports = CelestiaNode