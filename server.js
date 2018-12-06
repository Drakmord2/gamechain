/**
 * Require the credentials that you entered in the .env file
 */
require('dotenv').config();

const Web3 = require('web3');
const axios = require('axios');
const EthereumTx = require('ethereumjs-tx');
const log = require('ololog').configure({
    time: true
});
const ansi      = require('ansicolor').nice;
const express   = require("express");
let app         = express();

app.use(express.json());

/**
 * Network configuration
 */
let testnet = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`;

/**
 * Change the provider that is passed to HttpProvider to `mainnet` for live transactions.
 */
let web3 = new Web3(new Web3.providers.HttpProvider(testnet));

/**
 * Set the web3 default account to use as your public wallet address
 */
web3.eth.defaultAccount = process.env.WALLET_ADDRESS;

/**
 * Fetch the current transaction gas prices from https://ethgasstation.info/
 * 
 * @return {object} Gas prices at different priorities
 */
const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    let prices = {
        low:    response.data.safeLow / 10,
        medium: response.data.average / 10,
        high:   response.data.fast / 10
    };

    log(`Current ETH Gas Prices (in GWEI):`.cyan);
    log(`Low:       ${prices.low} (transaction completes in < 30 minutes)`.green);
    log(`Standard:  ${prices.medium} (transaction completes in < 5 minutes)`.yellow);
    log(`Fast:      ${prices.high} (transaction completes in < 2 minutes)`.red);

    return prices
};

/**
 * This is the process that will run when you execute the program.
 */
const createTransaction = async (sellingUserPK, sellingUserWallet, buyerUserWallet, assetId) => {
    /**
     * Fetch your personal wallet's balance
     */
    let myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
    let myBalance = web3.fromWei(myBalanceWei, 'ether');

    log(`Your wallet balance is currently ${myBalance} ETH`.green);

    /**
     * With every new transaction you send using a specific wallet address,
     * you need to increase a nonce which is tied to the sender wallet.
     */
    let nonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);
    log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta);

    const amountToSend = 0.001000000; // ETH
    /**
     * Build a new transaction object and sign it locally.
     */
    let details = {
        "to":       buyerUserWallet,
        "value":    web3.toHex(web3.toWei(amountToSend, 'ether')),
        "gas":      web3.toHex(100000),
        "gasPrice": web3.toHex(web3.toWei(2, 'gwei')), // converts the gwei price to wei
        "nonce":    nonce,
        "data":     JSON.stringify(assetId),
        "chainId":  parseInt(process.env.CHAIN_ID)
    };

    let transaction = new EthereumTx(details);

    /**
     * This is where the transaction is authorized on your behalf.
     * The private key is what unlocks your wallet.
     */
    transaction.sign(Buffer.from(sellingUserPK, 'hex'));

    /**
     * Now, we'll compress the transaction info down into a transportable object.
     */
    let serializedTransaction = transaction.serialize();

    /**
     * Note that the Web3 library is able to automatically determine the "from" address based on your private key.
     */

    /**
     * We're ready! Submit the raw transaction details to the provider configured above.
     */
    const transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'));

    /**
     * We now know the transaction ID, so let's build the public Etherscan url where
     * the transaction details can be viewed.
     */
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

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.post('/transacao', async (request, response) => {
    let result = {};
    try {
        let data    = request.body;
        result      = await createTransaction(
                            process.env.WALLET_PRIVATE_KEY,
                            process.env.WALLET_ADDRESS,
                            data.destination_wallet,
                            data.asset);

        response.send(result);
    } catch (err) {
        result = {"error": err.message};
        response.status(400).send(result);
    }
});
