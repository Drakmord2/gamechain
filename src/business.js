
const Web3          = require('web3');
const EthereumTx    = require('ethereumjs-tx');
const log           = require('ololog').configure({time: true});
const ansi          = require('ansicolor').nice;

let testnet = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`;
let web3    = new Web3(new Web3.providers.HttpProvider(testnet));

web3.eth.defaultAccount = process.env.WALLET_ADDRESS;

const createTransaction = async (sellingUserPK, sellingUserWallet, buyerUserWallet, assetId) => {

    let myBalanceWei    = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
    let myBalance       = web3.fromWei(myBalanceWei, 'ether');

    log(`Your wallet balance is currently ${myBalance} ETH`.green);

    let nonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta);

    const amountToSend = 0.001000000; // ETH

    let details = {
        "to":       buyerUserWallet,
        "value":    web3.toHex(web3.toWei(amountToSend, 'ether')),
        "gas":      web3.toHex(100000),
        "gasPrice": web3.toHex(web3.toWei(2, 'gwei')),
        "nonce":    nonce,
        "data":     JSON.stringify(assetId),
        "chainId":  parseInt(process.env.CHAIN_ID)
    };

    let transaction = new EthereumTx(details);
    transaction.sign(Buffer.from(sellingUserPK, 'hex'));

    let serializedTransaction   = transaction.serialize();
    const transactionId         = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'));

    let url = `https://rinkeby.etherscan.io/tx/${transactionId}`;
    log(url.cyan);

    log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta);

    return {
        "etherscan":    url,
        "transaction":  transactionId,
        "asset":        assetId,
        "seller":       sellingUserWallet,
        "buyer":        buyerUserWallet
    };
};

const transaction = async (req, res, next) => {
    let result = {};

    try {
        let data    = req.body;
        result      = await createTransaction(
                        process.env.WALLET_PRIVATE_KEY,
                        process.env.WALLET_ADDRESS,
                        data.destination_wallet,
                        data.asset
                    );

        res.send(result);

    } catch (err) {
        res.status(400).send({"error": err.message});
    }
};

exports.transaction =  transaction;
