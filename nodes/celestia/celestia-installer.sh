#!/bin/bash

NC="\e[0m"
BLUE="\033[1;34m"
function printLog {
  echo -e "${BLUE}${1}${NC}"
}

CHAIN_ID="mamaki"
TOKEN="celestia-appd"

printLog "Update packages"
sudo apt update
sudo apt install -y make gcc jq curl git lz4 build-essential chrony unzip
curl -s "https://gist.githubusercontent.com/stakemepro/de050a1108dc2c1b86a0f6fd8c0a7442/raw/283fda0a4efcbf7ea6e59482e72564c4dfca386f/go-install.sh" | bash

printLog "Install binary"
cd || return
rm -rf celestia-app
git clone https://github.com/celestiaorg/celestia-app
cd celestia-app || return
git checkout v0.6.0
make install
$TOKEN version

printLog "Init wallet and setup wallet"
$TOKEN config keyring-backend test
$TOKEN config chain-id $CHAIN_ID
$TOKEN init $STAKEME_MONIKER --chain-id $CHAIN_ID

printLog "Download genesis and setup config"
curl -s https://github.com/celestiaorg/networks/raw/master/mamaki/genesis.json > $HOME/.celestia-app/config/genesis.json
sha256sum $HOME/.celestia-app/config/genesis.json
sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.025utia"|g' $HOME/.celestia-app/config/app.toml

peers="e4429e99609c8c009969b0eb73c973bff33712f9@141.94.73.39:43656,09263a4168de6a2aaf7fef86669ddfe4e2d004f6@142.132.209.229:26656,13d8abce0ff9565ed223c5e4b9906160816ee8fa@94.62.146.145:36656,72b34325513863152269e781d9866d1ec4d6a93a@65.108.194.40:26676,322542cec82814d8903de2259b1d4d97026bcb75@51.178.133.224:26666,5273f0deefa5f9c2d0a3bbf70840bb44c65d835c@80.190.129.50:49656,7145da826bbf64f06aa4ad296b850fd697a211cc@176.57.189.212:26656,5a4c337189eed845f3ece17f88da0d94c7eb2f9c@209.126.84.147:26656,ec072065bd4c6126a5833c97c8eb2d4382db85be@88.99.249.251:26656,cd1524191300d6354d6a322ab0bca1d7c8ddfd01@95.216.223.149:26656,2fd76fae32f587eceb266dce19053b20fce4e846@207.154.220.138:26656,1d6a3c3d9ffc828b926f95592e15b1b59b5d8175@135.181.56.56:26656,fe2025284ad9517ee6e8b027024cf4ae17e320c9@198.244.164.11:26656,fcff172744c51684aaefc6fd3433eae275a2f31b@159.203.18.242:26656,f7b68a491bae4b10dbab09bb3a875781a01274a5@65.108.199.79:20356,6c076056fc80a813b26e24ba8d28fa374cd72777@149.102.153.197:26656,180378bab87c9cecea544eb406fcd8fcd2cbc21b@168.119.122.78:26656,6c076056fc80a813b26e24ba8d28fa374cd72777@149.102.153.197:26656,88fa96d09a595a1208968727819367bd2fe8eabe@164.70.120.56:26656,84133cfde6e5fcaf5915436d56b3eef1d1996d17@45.132.245.56:26656,42b331adaa9ece4c455b92f0d26e3382e46d43f0@161.97.180.20:36656,c8c0456a5174ab082591a9466a6e0cb15c915a65@194.233.85.193:26656,6a62bf1f489a5231ddc320a2607ab2595558db75@154.12.240.49:26656,d0b19e4d133441fd41b4d74ac8de2138313ad49e@195.201.41.137:26656,bf199295d4c142ebf114232613d4796e6d81a8d0@159.69.110.238:26656,a46bbdb81e66c950e3cdbe5ee748a2d6bdb185dd@161.97.168.77:26656"
sed -i.bak -e "s/^persistent-peers *=.*/persistent-peers = \"$peers\"/" $HOME/.celestia-app/config/config.toml
bpeers="f0c58d904dec824605ac36114db28f1bf84f6ea3@144.76.112.238:26656"
sed -i.bak -e "s/^bootstrap-peers *=.*/bootstrap-peers = \"$bpeers\"/" $HOME/.celestia-app/config/config.toml

printLog "Setup pruning and other settings"
sed -i.bak -e "s/^timeout-commit *=.*/timeout-commit = \"25s\"/" $HOME/.celestia-app/config/config.toml
sed -i.bak -e "s/^skip-timeout-commit *=.*/skip-timeout-commit = false/" $HOME/.celestia-app/config/config.toml
sed -i.bak -e "s/^mode *=.*/mode = \"validator\"/" $HOME/.celestia-app/config/config.toml
sed -i.bak -e "s/^use-legacy *=.*/use-legacy = \"true\"/" $HOME/.celestia-app/config/config.toml

sed -i -e "s/^pruning *=.*/pruning = \"custom\"/" $HOME/.celestia-app/config/app.toml && \
sed -i -e "s/^pruning-keep-recent *=.*/pruning-keep-recent = \"100\"/" $HOME/.celestia-app/config/app.toml && \
sed -i -e "s/^pruning-keep-every *=.*/pruning-keep-every = \"0\"/" $HOME/.celestia-app/config/app.toml && \
sed -i -e "s/^pruning-interval *=.*/pruning-interval = \"50\"/" $HOME/.celestia-app/config/app.toml

printLog "Create service file"
sudo tee /etc/systemd/system/celestia-appd.service > /dev/null << EOF
[Unit]
Description=Empower Chain Node
After=network-online.target
[Service]
User=$USER
ExecStart=$(which celestia-appd) start
Restart=on-failure
RestartSec=10
LimitNOFILE=10000
[Install]
WantedBy=multi-user.target
EOF
