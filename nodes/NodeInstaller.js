const { exec } = require('shelljs');
function NodeInstaller() {
    let logs = [];
    let child;
    let status = 'not installing';
    function run(command) {
        status = 'processing';
        child = exec(command, {async : true, shell: '/bin/bash'});
        child.stdout.on('data', function(data) {
            if (logs.length === 4) {
                logs = logs.splice(2, 4);
                return;
            }
            logs.push(data);
        });
        child.stderr.on('data', (data) => {
            if (logs.length === 4) {
                logs = logs.splice(2, 4);
                return;
            }
            logs.push(data);
        });

        child.on('error', (error) => {
            console.error(`error: ${error.message}`);
        });

        child.on('close', (code) => {
            status = 'end';
        });
    }
    function getLogs() {
        return logs.join('');
    }
    function getStatus() {
        return status;
    }

    return {
        getLogs,
        run,
        getStatus
    }
}

module.exports = NodeInstaller