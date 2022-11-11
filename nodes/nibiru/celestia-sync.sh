touch $HOME/.celestia-app/data/status-snapshot.txt
echo downloading > $HOME/.celestia-app/data/status-snapshot.txt
cd $HOME
rm -rf $HOME/.celestia-app/data
mkdir -p $HOME/.celestia-app/data
SNAP_NAME=$(curl -s https://snaps.qubelabs.io/celestia/ | egrep -o ">mamaki.*tar" | tr -d ">")
wget -q https://snaps.qubelabs.io/celestia/${SNAP_NAME} | tar xf - -C $HOME/.celestia-app/data/
echo success > $HOME/.celestia-app/data/status-snapshot.txt