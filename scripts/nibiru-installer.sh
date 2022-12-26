#!/bin/bash

NC="\e[0m"
BLUE="\033[1;34m"
function printLog {
  echo -e "${BLUE}${1}${NC}"
}

CHAIN_ID="nibiru-testnet-2"
TOKEN="nibid"

printLog "Update packages"
sudo apt update
sudo apt install -y make gcc jq curl git lz4 build-essential chrony unzip
source <(curl -s https://gist.githubusercontent.com/stakemepro/de050a1108dc2c1b86a0f6fd8c0a7442/raw/942032db9f18235d2b87ebe4ac5d28dda4632a37/go-install.sh)

printLog "Install binary"
cd || return
rm -rf nibiru
git clone https://github.com/NibiruChain/nibiru
cd nibiru || return
git checkout v0.16.2
make install
$TOKEN version

printLog "Init wallet and setup wallet"
$TOKEN config keyring-backend test
$TOKEN config chain-id $CHAIN_ID
$TOKEN init $STAKEME_MONIKER --chain-id $CHAIN_ID

printLog "Download genesis and setup config"
curl -s https://rpc.testnet-2.nibiru.fi/genesis | jq -r .result.genesis > $HOME/.nibid/config/genesis.json
sha256sum $HOME/.nibid/config/genesis.json # 5cedb9237c6d807a89468268071647649e90b40ac8cd6d1ded8a72323144880d

ADDRBOOK_NAME=$(curl -s http://nibiru.stakeme.pro:8080/public/ | egrep -o ">nibiru_addrbook.*\.json" | tr -d ">")
curl -s http://nibiru.stakeme.pro:8080/public/$ADDRBOOK_NAME > $HOME/.nibid/config/addrbook.json

sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.0001unibi"|g' $HOME/.nibid/config/app.toml
seeds="7f30e0e50fa219fad61b1378592285f6ee2b70dc@nibiru.stakeme.pro:36656"
peers="7f30e0e50fa219fad61b1378592285f6ee2b70dc@nibiru.stakeme.pro:36656"
sed -i -e 's|^seeds *=.*|seeds = "'$seeds'"|; s|^persistent_peers *=.*|persistent_peers = "'$peers'"|' $HOME/.nibid/config/config.toml

printLog "Setup pruning and other settings"
sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.0001unibi"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning = "default"|pruning = "custom"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning-keep-recent = "0"|pruning-keep-recent = "100"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning-interval = "0"|pruning-interval = "10"|g' $HOME/.nibid/config/app.toml

printLog "Create service file"
sudo tee /etc/systemd/system/nibid.service > /dev/null << EOF
[Unit]
Description=Nibiru Node
After=network-online.target
[Service]
User=$USER
ExecStart=$(which nibid) start
Restart=on-failure
RestartSec=10
LimitNOFILE=10000
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable nibid

nibid tendermint unsafe-reset-all --home $HOME/.nibid --keep-addr-book

SNAP_RPC="http://nibiru.stakeme.pro:36657"
LATEST_HEIGHT=$(curl -s $SNAP_RPC/block | jq -r .result.block.header.height); \
BLOCK_HEIGHT=$((LATEST_HEIGHT - 1000)); \
TRUST_HASH=$(curl -s "$SNAP_RPC/block?height=$BLOCK_HEIGHT" | jq -r .result.block_id.hash)

echo $LATEST_HEIGHT $BLOCK_HEIGHT $TRUST_HASH

sed -i -E "s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true| ; \
s|^(rpc_servers[[:space:]]+=[[:space:]]+).*$|\1\"$SNAP_RPC,$SNAP_RPC\"| ; \
s|^(trust_height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT| ; \
s|^(trust_hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|" $HOME/.nibid/config/config.toml

node $HOME/stakeme-connector/nodes/nibiru/set-ports-node.js nibid .nibid
sudo systemctl restart nibid
