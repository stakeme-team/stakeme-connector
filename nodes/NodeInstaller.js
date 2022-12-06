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
        let template = logs.join('');
        if (template > 4096) template = template.slice(template.length - 4096)
        return template;
    }
    function getStatus() {
        return status;
    }
    function setStatus(toStatus) {
        status = toStatus;
    }

    return {
        getLogs,
        run,
        getStatus,
        setStatus
    }
}

module.exports = NodeInstaller