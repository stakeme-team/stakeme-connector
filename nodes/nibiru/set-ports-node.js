const shell = require("shelljs");


const TOKEN = process.argv[2];
const CONFIG = process.argv[3];

function openPort(port) {
    return shell.exec(`lsof -Pi :${port} -sTCP:LISTEN`, {shell: '/bin/bash', silent: true}).code !== 0;
}

for (let i = 0; i < 10; i++) {
    let port = `${i + 26}657`;
    if (openPort(port)) {
        console.log('yes', port);
        const proxyAppPort = `${i + 26}658`;
        const firstLaddrPort = `${i + 26}657`;
        const pprofLaddrPort = `${i + 6}060`;
        const secondLaddrPort = `${i + 26}656`;
        const externalAddress = `${i + 26}656`;
        const prometheusListenAddr = `${i + 26}660`;

        const firstAddress = `${i + 1}317`;
        const secondAddress = `${i + 8}080`;
        const thirdAddress = `${i + 9}090`;
        const fourthAddress = `${i + 9}091`;
        if (
            openPort(proxyAppPort) && openPort(firstLaddrPort) && openPort(pprofLaddrPort) &&
            openPort(secondLaddrPort) && openPort(externalAddress) && openPort(prometheusListenAddr) &&
            openPort(firstAddress) && openPort(secondAddress) && openPort(thirdAddress) &&
            openPort(fourthAddress)
        ) {

            const firstCommandChange = `sed -i.bak -e "\\
s%^proxy_app = \\"tcp://127.0.0.1:26658\\"%proxy_app = \\"tcp://127.0.0.1:${i+26}658\\"%; \\
s%^laddr = \\"tcp://127.0.0.1:26657\\"%laddr = \\"tcp://0.0.0.0:${i+26}657\\"%; \\
s%^pprof_laddr = \\"localhost:6060\\"%pprof_laddr = \\"localhost:${i+6}060\\"%; \\
s%^laddr = \\"tcp://0.0.0.0:26656\\"%laddr = \\"tcp://0.0.0.0:${i+26}656\\"%; \\
s%^external_address = \\"\\"%external_address = \\"\`echo $(wget -qO- eth0.me):${i+26}656\`\\"%; \\
s%^prometheus_listen_addr = \\":26660\\"%prometheus_listen_addr = \\":${i+26}660\\"%" $HOME/${CONFIG}/config/config.toml`;
            const secondCommandChange = `sed -i.bak -e "\\
s%^address = \\"tcp://0.0.0.0:1317\\"%address = \\"tcp://0.0.0.0:${i+1}317\\"%; \\
s%^address = \\":8080\\"%address = \\":${i+8}080\\"%; \\
s%^address = \\"0.0.0.0:9090\\"%address = \\"0.0.0.0:${i+9}090\\"%; \\
s%^address = \\"0.0.0.0:9091\\"%address = \\"0.0.0.0:${i+9}091\\"%" $HOME/${CONFIG}/config/app.toml`
            const thirdCommandChange = `echo "export NODE=http://localhost:${i+26}657" >> $HOME/.bash_profile && \\
source $HOME/.bash_profile && \\
${TOKEN} config node $NODE`
            console.log(firstCommandChange);
            console.log(secondCommandChange);
            console.log(thirdCommandChange);
            shell.exec(firstCommandChange, {silent: true, shell: '/bin/bash'});
            shell.exec(secondCommandChange, {silent: true, shell: '/bin/bash'});
            shell.exec(thirdCommandChange, {silent: true, shell: '/bin/bash'});
            break;
        }
    }
}