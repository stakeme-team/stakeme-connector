#!/bin/bash

NC="\e[0m"
BLUE="\033[1;34m"
function printLog {
  echo -e "${BLUE}${1}${NC}"
}

CHAIN_ID="okp4-nemeton-1"
TOKEN="okp4d"

printLog "Update packages"
sudo apt update
sudo apt install -y make gcc jq curl git lz4 build-essential chrony unzip
source <(curl -s https://gist.githubusercontent.com/stakemepro/de050a1108dc2c1b86a0f6fd8c0a7442/raw/942032db9f18235d2b87ebe4ac5d28dda4632a37/go-install.sh)

printLog "Install binary"
cd || return
rm -rf okp4d
git clone https://github.com/okp4/okp4d.git
cd okp4d || return
git checkout v3.0.0
make install
okp4d version

printLog "Init wallet and setup wallet"
okp4d config keyring-backend test
okp4d config chain-id $CHAIN_ID
okp4d init $STAKEME_MONIKER --chain-id $CHAIN_ID

printLog "Download genesis and setup config"
curl https://raw.githubusercontent.com/okp4/networks/main/chains/nemeton-1/genesis.json > $HOME/.okp4d/config/genesis.json
sha256sum $HOME/.okp4d/config/genesis.json

ADDRBOOK_NAME=$(curl -s http://okp4.stakeme.pro:8080/public/ | egrep -o ">okp4_addrbook.*\.json" | tr -d ">")
curl -s http://okp4.stakeme.pro:8080/public/$ADDRBOOK_NAME > $HOME/.okp4d/config/addrbook.json

seeds=""
peers="a6fc531f7274aa6615fa33198496ea69b2023a0f@okp4.stakeme.pro:29656,ee4c5d9a8ac7401f996ef9c4d79b8abda9505400@144.76.97.251:12656,2e85c1d08cfca6982c74ef2b67251aa459dd9b2f@65.109.85.170:43656"
sed -i -e 's|^seeds *=.*|seeds = "'$seeds'"|; s|^persistent_peers *=.*|persistent_peers = "'$peers'"|' $HOME/.okp4d/config/config.toml

printLog "Setup pruning and other settings"
sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.0001uknow"|g' $HOME/.okp4d/config/app.toml
sed -i 's|pruning = "default"|pruning = "custom"|g' $HOME/.okp4d/config/app.toml
sed -i 's|pruning-keep-recent = "0"|pruning-keep-recent = "100"|g' $HOME/.okp4d/config/app.toml
sed -i 's|pruning-interval = "0"|pruning-interval = "17"|g' $HOME/.okp4d/config/app.toml

printLog "Create service file"
sudo tee /etc/systemd/system/okp4d.service > /dev/null << EOF
[Unit]
Description=OKP4 Node
After=network-online.target
[Service]
User=$USER
ExecStart=$(which okp4d) start
Restart=on-failure
RestartSec=10
LimitNOFILE=10000
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable okp4d

cp $HOME/.okp4d/data/priv_validator_state.json $HOME/.okp4d/priv_validator_state.json.backup
okp4d tendermint unsafe-reset-all --home $HOME/.okp4d --keep-addr-book
rm -rf $HOME/.okp4d/data
SNAPSHOT_NAME=$(curl -s http://okp4.stakeme.pro:8080/public/ | egrep -o ">okp4_snapshot.*\.tar.lz4" | tr -d ">")
curl -s http://okp4.stakeme.pro:8080/public/$SNAPSHOT_NAME | lz4 -dc - | tar -xf - -C $HOME/.okp4d
mv $HOME/.okp4d/priv_validator_state.json.backup $HOME/.okp4d/data/priv_validator_state.json

node $HOME/stakeme-connector/nodes/okp4/set-ports-node.js okp4d .okp4d
sudo systemctl restart okp4d
