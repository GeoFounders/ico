/*

    Crowdsale Simulation by Shaun Shull

*/

// get fs
var fs = require('fs');
var BigNumber = require('bignumber.js');
var EthTx = require('ethereumjs-tx');
var assertFail = require('./assertFail');

// set contract objects
var TokenContract = artifacts.require("./GUNS.sol");

// shorthand helpers
var balance = (acct) => { return web3.fromWei(web3.eth.getBalance(acct), 'ether').toNumber() };
var tokens = (bignum) => { return web3.fromWei(bignum, 'ether').toNumber() };
var tcount = (acct) => { return web3.toHex(web3.eth.getTransactionCount(acct)) };
var adata = (acct) => { return { address: acct, funds: balance(acct) } };

// let's get started
contract('GUNS', function(accounts) {

    // account addresses
    const launcherAddress = accounts[0];
    const etherDepositAddress = accounts[1];
    const tokensDepositAddress = accounts[2];
    const participant1Address = accounts[3];
    const participant2Address = accounts[4];

    // various vars
    var rawData = { 
        testData: { 
            launcher: { address: accounts[0], funds: balance(accounts[0]) },
            ether: { address: accounts[1], funds: balance(accounts[1]) },
            tokens: { address: accounts[2], funds: balance(accounts[2]) },
            participant1: { address: accounts[3], funds: balance(accounts[3]) },
            participant2: { address: accounts[4], funds: balance(accounts[4]) },
        } 
    };
    let mainContract;

    // crowdsale block range
    const startBlock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + 8;

    it("Initializing Contract", async function() {
        
        // create contract
        mainContract = await TokenContract.new();

        // record contract address and prep data
        rawData.contractAddress = mainContract.address;
        rawData.contractData = {};

        // initialize contract
        await mainContract.initialize(etherDepositAddress, tokensDepositAddress, startBlock, endBlock);
        
        // record in-contract variable values
        var start = {};
        start.hostAccount = await mainContract.hostAccount();
        start.ethFundsDepositAccount = await mainContract.ethFundDeposit();
        start.gunsFundsDepositAccount = await mainContract.gunsFundDeposit();
        start.currentBlock = web3.eth.blockNumber;
        start.fundingStartBlock = await mainContract.fundingStartBlock();
        start.fundingEndBlock = await mainContract.fundingEndBlock();
        start.totalSupplySoFar = tokens(await mainContract.totalSupply());
        start.gunsFundsTokenBalanceSoFar = tokens(await mainContract.balanceOf(start.gunsFundsDepositAccount));
        start.contractETHBalance = balance(mainContract.address);
        start.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        start.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        rawData.contractData.start = start;

    });

    it("Participant 1 Sends 10 ETH for 10000 GUNS", async function() {

        // send ETH to contract
        await web3.eth.sendTransaction({
            from: participant1Address, 
            to: mainContract.address, 
            value: web3.toWei(10, 'ether'), 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record items
        var buyTokensTest = {};
        buyTokensTest.currentBlock = web3.eth.blockNumber;
        buyTokensTest.contractETHBalance = balance(mainContract.address);
        buyTokensTest.participant1AfterPaying = adata(participant1Address);
        buyTokensTest.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        buyTokensTest.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        rawData.contractData.buyTokensTest = buyTokensTest;

    });

    it("Participant 1 Sends 1.35784 ETH for 1357.84 GUNS", async function() {

        // send ETH to contract
        await web3.eth.sendTransaction({
            from: participant1Address, 
            to: mainContract.address, 
            value: web3.toWei(1.35784, 'ether'), 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record items
        var buyTokensTest = {};
        buyTokensTest.currentBlock = web3.eth.blockNumber;
        buyTokensTest.contractETHBalance = balance(mainContract.address);
        buyTokensTest.participant1AfterPaying = adata(participant1Address);
        buyTokensTest.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        buyTokensTest.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        buyTokensTest.totalSupplyNow = tokens(await mainContract.totalSupply());
        rawData.contractData.fractionalTokenBuyTest = buyTokensTest;

    });

    it("Participant 1 Transfers 100 GUNS to Participant 2", async function() {

        // call contract function
        await mainContract.transfer.sendTransaction(participant2Address, web3.toWei(100, 'ether'), {
            from: participant1Address, 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record items
        var transferTokensTest = {};
        transferTokensTest.currentBlock = web3.eth.blockNumber;
        transferTokensTest.contractETHBalance = balance(mainContract.address);
        transferTokensTest.participant1Balance = balance(participant1Address);
        transferTokensTest.participant2Balance = balance(participant2Address);
        transferTokensTest.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        transferTokensTest.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        rawData.contractData.transferTokensTest = transferTokensTest;

    });

    it("Participant 2 Sends 5,000 ETH for 5,000,000 GUNS", async function() {

        // send ETH to contract
        await web3.eth.sendTransaction({
            from: participant2Address, 
            to:mainContract.address, 
            value: web3.toWei(5000, 'ether'), 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record items
        var buyTokensTest = {};
        buyTokensTest.currentBlock = web3.eth.blockNumber;
        buyTokensTest.contractETHBalance = balance(mainContract.address);
        buyTokensTest.participant1Balance = balance(participant1Address);
        buyTokensTest.participant2Balance = balance(participant2Address);
        buyTokensTest.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        buyTokensTest.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        rawData.contractData.buyMoreTokensTest = buyTokensTest;

    });

    it("Participant 2 Sends Another 50,000 ETH for 50,000,000 GUNS", async function() {

        // send ETH to contract
        await web3.eth.sendTransaction({
            from: participant2Address, 
            to:mainContract.address, 
            value: web3.toWei(50000, 'ether'), 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record items
        var buyTokensTest = {};
        buyTokensTest.currentBlock = web3.eth.blockNumber;
        buyTokensTest.contractETHBalance = balance(mainContract.address);
        buyTokensTest.participant1Balance = balance(participant1Address);
        buyTokensTest.participant2Balance = balance(participant2Address);
        buyTokensTest.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        buyTokensTest.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        buyTokensTest.totalSupplyNow = tokens(await mainContract.totalSupply());
        rawData.contractData.buyEvenMoreTokensTest = buyTokensTest;

    });

    it("Participant 1 Sends 10,000 ETH for 10,000,000 GUNS - Exceeding Max Cap And Failing", async function() {

        await assertFail(async function() {
            await web3.eth.sendTransaction({
                from: participant1Address, 
                to:mainContract.address, 
                value: web3.toWei(10000, 'ether'), 
                gasLimit: 21000, 
                gasPrice: web3.eth.gasPrice
            });
        });

        // get exchange rate
        var exchangeRateRaw = new BigNumber(await mainContract.tokenExchangeRate());
        var exchangeRate = exchangeRateRaw.toNumber();
        var desiredPurchase = 10000;
        var tokensToPurchase = desiredPurchase * exchangeRate;
        var totalSupplyNow = tokens(await mainContract.totalSupply());

        // record items
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.attemptedNumTokensToBuy = tokensToPurchase;
        dat.wouldHaveMadeSupply = totalSupplyNow + tokensToPurchase;
        rawData.contractData.exceedTokenQuantityTest = dat;

    });

    it("Failed to Finalize CrowdSale By Authorized Account Because Block Not Met", async function() {

        await assertFail(async function() {
            await mainContract.finalize.sendTransaction({
                from: tokensDepositAddress, 
                gasLimit: 21000, 
                gasPrice: web3.eth.gasPrice
            });
        });

        // record items
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.isContractFinalized = await mainContract.isFinalized();
        rawData.contractData.finalizeAuthBlockNotMetTest = dat;

    });

    it("Failed to Finalize CrowdSale By Unauthorized Account", async function() {

        await assertFail(async function() {
            await mainContract.finalize.sendTransaction({
                from: participant1, 
                gasLimit: 21000, 
                gasPrice: web3.eth.gasPrice
            });
        });

        // record items
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.isContractFinalized = await mainContract.isFinalized();
        rawData.contractData.finalizeNonAuthTest = dat;

    });

    it("Assemble Data Before Finalize", async function() {

        // record items
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.totalSupplySoFar = tokens(await mainContract.totalSupply());
        dat.ethFundsDepositAccount = await mainContract.ethFundDeposit();
        dat.gunsFundsDepositAccount = await mainContract.gunsFundDeposit();
        dat.ethFundsETHBalanceSoFar = balance(dat.ethFundsDepositAccount);
        dat.gunsFundsETHBalanceSoFar = balance(dat.gunsFundsDepositAccount);
        dat.contractETHBalance = balance(mainContract.address);
        dat.participant1Balance = balance(participant1Address);
        dat.participant2Balance = balance(participant2Address);
        dat.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        dat.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        dat.isContractFinalized = await mainContract.isFinalized();
        rawData.contractData.preFinalizeData = dat;

    });

    it("Finalize CrowdSale By Authorized Account After End Block", async function() {

        await mainContract.finalize.sendTransaction({
            from: etherDepositAddress, 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });
        
        // record items
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.totalSupplyFinal = tokens(await mainContract.totalSupply());
        dat.ethFundsDepositAccount = await mainContract.ethFundDeposit();
        dat.gunsFundsDepositAccount = await mainContract.gunsFundDeposit();
        dat.ethFundsETHBalanceFinal = balance(dat.ethFundsDepositAccount);
        dat.gunsFundsETHBalanceFinal = balance(dat.gunsFundsDepositAccount);
        dat.gunsFundsTokenBalanceFinal = tokens(await mainContract.balanceOf(dat.gunsFundsDepositAccount));
        dat.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        dat.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        dat.contractETHBalance = balance(mainContract.address);
        dat.isContractFinalized = await mainContract.isFinalized();
        rawData.contractData.finalizeTest = dat;

    });

    it("Participant 1 Accidentally Transfers 100 Tokens to Contract, Token Cleanup Engaged", async function() {

        // main raw data root
        rawData.contractData.mistakenTokensTest = {};

        // record pre-transfer data
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.totalSupply = tokens(await mainContract.totalSupply());
        dat.gunsAccount = await mainContract.gunsFundDeposit();
        dat.gunsAccountTokens = tokens(await mainContract.balanceOf(dat.gunsAccount));
        dat.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        rawData.contractData.mistakenTokensTest.preTransfer = dat;
        
        // transfer tokens
        await mainContract.transfer.sendTransaction(mainContract.address, web3.toWei(100, 'ether'), {
            from: participant1Address, 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record post-transfer data
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.totalSupply = tokens(await mainContract.totalSupply());
        dat.gunsAccount = await mainContract.gunsFundDeposit();
        dat.gunsAccountTokens = tokens(await mainContract.balanceOf(dat.gunsAccount));
        dat.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        dat.contractTokens = tokens(await mainContract.balanceOf(mainContract.address));
        rawData.contractData.mistakenTokensTest.postTransfer = dat;

        // clean up mistaken tokens
        await mainContract.mistakenTokens.sendTransaction({
            from: etherDepositAddress, 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record post-cleanup data
        var dat = {};
        dat.currentBlock = web3.eth.blockNumber;
        dat.totalSupply = tokens(await mainContract.totalSupply());
        dat.gunsAccount = await mainContract.gunsFundDeposit();
        dat.gunsAccountTokens = tokens(await mainContract.balanceOf(dat.gunsAccount));
        dat.participant1Tokens = tokens(await mainContract.balanceOf(participant1Address));
        dat.participant2Tokens = tokens(await mainContract.balanceOf(participant2Address));
        dat.sumPeopleAndGunsAcct = dat.participant1Tokens + dat.participant2Tokens + dat.gunsAccountTokens;
        dat.contractTokens = tokens(await mainContract.balanceOf(mainContract.address));
        rawData.contractData.mistakenTokensTest.postCleanUp = dat;

    });

    it("Pay This Contract via EmergencyPay After CrowdSale, Don't Ask Me Why", async function() {

        // main raw data root
        rawData.contractData.payContractTest = {};

        // record pre-pay data
        var dat = {};
        dat.participant1Balance = balance(participant1Address);
        dat.contractETHBalance = balance(mainContract.address);
        rawData.contractData.payContractTest.prePay = dat;

        // send ETH to contract
        await mainContract.emergencyPay.sendTransaction({
            from: participant1Address, 
            to: mainContract.address, 
            value: web3.toWei(132, 'ether'), 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record post-pay data
        var dat = {};
        dat.participant1Balance = balance(participant1Address);
        dat.contractETHBalance = balance(mainContract.address);
        rawData.contractData.payContractTest.postPay = dat;

    });

    it("Finalize Again to Collect Contract Funds", async function() {

        // main raw data root
        rawData.contractData.finalizeAgain = {};

        // record pre-run data
        var dat = {};
        dat.ethFundsDepositAccount = await mainContract.ethFundDeposit();
        dat.ethAccountBalance = balance(dat.ethFundsDepositAccount);
        dat.contractETHBalance = balance(mainContract.address);
        dat.totalSupply = tokens(await mainContract.totalSupply());
        rawData.contractData.finalizeAgain.preRun = dat;

        // finalize the contract again
        await mainContract.finalize.sendTransaction({
            from: etherDepositAddress, 
            gasLimit: 21000, 
            gasPrice: web3.eth.gasPrice
        });

        // record post-run data
        var dat = {};
        dat.ethFundsDepositAccount = await mainContract.ethFundDeposit();
        dat.ethAccountBalance = balance(dat.ethFundsDepositAccount);
        dat.contractETHBalance = balance(mainContract.address);
        dat.totalSupply = tokens(await mainContract.totalSupply());
        rawData.contractData.finalizeAgain.postRun = dat;

    });

    it("Write Raw Data to Logs", async function() {
        fs.writeFile('./logs/test.txt', JSON.stringify(rawData, null, "\t") , 'utf-8', function(){});
    });

});