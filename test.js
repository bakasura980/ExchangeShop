var Exchangeshop = artifacts.require("../contracts/ExchangeShop.sol");
require("../test/assertExtensions");
web3.utils = require('./utils.js');

contract("Exchangeshop", function(accounts){

    let owner = accounts[0];
    let alice = accounts[1];
    let bob = accounts[2];
    let exchangeshopInstance; 
    let maxDeadline = 5;
    let password = { 
                     key1: "VTNN",
                     key2: "Vij tam napravi neshto" 
                   };
    let key = web3.sha3(web3.toHex(password.key1), web3.toHex(password.key2), { encoding: 'hex' });
    let bgCurrencyCommision = 3;

    describe("Communication with exchange shop in a perfect way", function(){
        let remittanceAmountWithCommission;

        before(async function(){
            exchangeshopInstance = await Exchangeshop.new(maxDeadline, {from: owner});
        });
    
        it("should be owned by owner", async function(){
            let contractOwner = await exchangeshopInstance.owner({from: owner});
            assert.equal(contractOwner, owner, "The owner of the contract is incorrect");
        });
    
        it("should set deadline limit properly", async function(){
            let deadlineLimit = await exchangeshopInstance.deadlineLimit({from: owner});
            assert.equal(deadlineLimit, maxDeadline, "Deadline limit is not set correctly");
        });
    
        //Have to check and write it
        it("should add currency", async function(){
            let currencyTx = await exchangeshopInstance.addCurrency("BG", bgCurrencyCommision, {from: owner});
            let eventArgs = getEventArgsValue(currencyTx);
            assert.equal(web3.utils.hexToUtf8(eventArgs.name), "BG", "Currency name is not set correctly");
            assert.equal(eventArgs.commission.toString(10), bgCurrencyCommision, "Currency commission is not set correctly");
        });

        

        it("should add a new remittance", async function(){
            let deadline = 3;
            let currencyName = "BG";
            let addedRemittanceTx = await exchangeshopInstance.addRemittance(deadline, key, bob, currencyName, {from: alice, value: 1000});
            let txEvent = getEventArgsValue(addedRemittanceTx);

            let currentBlockNumber = web3.eth.blockNumber;
            remittanceAmountWithCommission = 1000 - ((1000 * bgCurrencyCommision) / 100);

            assert.equal(txEvent.deadline.toNumber(), currentBlockNumber + deadline, "Added remittance is with incorrect deadline");
            assert.equal(txEvent.owner, alice, "Added remittance is with incorrect owner");
            assert.equal(txEvent.to, bob, "Added remittance is with incorrect 'to'");
            assert.equal(txEvent.amount.toString(10), remittanceAmountWithCommission, "Added remittance is with incorrect amount");
        });

        //write more
        it("should unlock alice's remittance", async function(){

            console.log(key);
            let aliceUnlockedRemittanceTx = await exchangeshopInstance.unlockRemittance(password.key1, password.key2, {from: owner});
            let newKey = await exchangeshopInstance.key({from: owner});
            console.log(newKey);
            // let eventArgs = getEventArgsValue(aliceUnlockedRemittanceTx); 

            // assert.equal(eventArgs.to, bob, "Remittance is not unlocked correcly (To)");
            // assert.equal(eventArgs.amount.toString(10), remittanceAmountWithCommission, "Remittance is not unlocked correcly (Amount)");
        });

        function getEventArgsValue(tx){
            return tx.logs[0].args;
        }

        //should get bobs balance and contract amount
        // it("should process bob's withdraw", async function(){

        //     let remittanceAmountBeforeWithdraw = await exchangeshopInstance.unlockedRemittances(bob, {from: owner});

        //     await proceessWithdraw(bob, (bobsBalance) => {
        //         assert(
        //             bobsBalance.beforeWithdraw.eq(bobsBalance.afterWithdraw.plus(bobsBalance.txCost).minus(remittanceAmountBeforeWithdraw)), 
        //             "Bob's balance is incorrect after withdraw"
        //         );

        //         let remittanceAmountAfterWithdraw = await exchangeshopInstance.unlockedRemittances(bob, {from: owner}).toString(10);
        //         assert.equal(remittanceAmountAfterWithdraw, 0, "Bob's balance in the contract is not correct");
        //     });
        // });

        // //have to check commission 
        // it("should process owner's commission withdraw", async function(){

        //     // await proceessWithdraw(owner, (ownerBalance) => {
        //     //     //check it 
        //     //     let commision = ownerBalance.withdrawTx;
        //     //     assert(
        //     //         owner.beforeWithdraw.eq(owner.afterWithdraw.plus(owner.txCost).minus(commission)), 
        //     //         "Owner's balance is incorrect after commission withdraw"
        //     //     );

        //     //     assert.equal(remittanceAmountAfterWithdraw, 0, "Commission is incorrect after withdraw");
        //     // });

        //     // await exchangeshopInstance.withdrawCommission({from: owner});
        // });

        // //process key and check her's balance and remittance one
        // it("should return alice's funds back to her", function(){
        //     await exchangeshopInstance.withdrawFundsBack(key, {from: alice});
        // });

        // async function processWithdraw(personAddress, next){
        //     let personBalance = { beforeWithdraw: 0, afterWithdraw: 0, txCost: 0, withdrawTx: 0 };
        //     personBalance.beforeWithdraw = await web3.eth.getBalance(bob);

        //     let withdraw = await exchangeshopInstance.withdrawFunds();
        //     personBalance.txCost = await getTransactionGasCost(withdraw["tx"]);
        //     personBalance.withdrawTx = withdraw;

        //     personBalance.afterWithdraw = await web3.eth.getBalance(bob);

        //     next(personBalance);
        // }

        // async function getTransactionGasCost(tx) {
        //     let transaction = await web3.eth.getTransactionReceipt(tx);
        //     let amount = transaction.gasUsed;
        //     let price = await web3.eth.getTransaction(tx).gasPrice;
          
        //     return price * amount;
        // }

        it("should destroy the contract", async function(){
            let eventParams = { destroyer: owner };
            assert.expectEvent(exchangeshopInstance.destroy({from: owner}), {destroyer: owner}, eventParams); 
        });
    });

    // describe("Communication with exchange shop in a bad way", function(){

    //     //generate new key
    //     let unusedKey;

    //     describe("Create contract", function(){
    //         it("should not create the contract with an invalid deadline", async function(){
    //             let negativeDeadline = -1;
    //             assert.expectRevert(Exchangeshop.new(negativeDeadline, {from: owner}));
    //         });
    //     });
        
    //     describe("Add currency", function(){
    //         it("should not add currency if the method callee is not the owner", async function(){
    //             assert.expectRevert(exchangeshopInstance.addCurrency("Euro", currencyCommision, {from: alice}));
    //         });
    
    //         it("should not add currency if it already exists", async function(){
    //             assert.expectRevert(exchangeshopInstance.addCurrency("BG", currencyCommision, {from: owner}));
    //         });
    //     });

    //     describe("Withdraw commission", function(){
    //         it("should not process withdraw if the method callee is not the owner", async function(){
    //             assert.expectRevert(exchangeshopInstance.withdrawCommission({from: alice}));
    //         });
    //     });

    //     describe("Add remittance", function(){
    //         it("should not add remittance with higher deadline than the limit", async function(){
    //             let higherDeadline = deadline + 1;
    //             assert.expectRevert(exchangeshopInstance.addRemittance(higherDeadline, unusedKey, bob, currencyName, {from: alice, value: 1000}));
    //         });
    
    //         it("should not add remittance when such key already exists", async function(){
    //             assert.expectRevert(exchangeshopInstance.addRemittance(deadline, key, bob, currencyName, {from: alice, value: 1000}));
    //         });

    //         it("should not add remittance with empty 'To' address", async function(){
    //             let zeroAddress = 0x0000000000000000000000000000000000000000; 
    //             assert.expectRevert(exchangeshopInstance.addRemittance(deadline, unusedKey, zeroAddress, currencyName, {from: alice, value: 1000}));
    //         });

    //         it("should not add remittance with a currency which is not maintainable", async function(){
    //             let currencyName = "Random";
    //             assert.expectRevert(exchangeshopInstance.addRemittance(deadline, unusedKey, bob, currencyName, {from: alice, value: 1000}));
    //         });
    //     });

    //     describe("Unlock remittance", function(){
    //         it("should not process unlock if the method callee is not the owner", async function(){
    //             assert.expectRevert(exchangeshopInstance.unlockRemittance(password.key1, password.key2, {from: alice}));
    //         });
    //         //Have to think for more clever solution
    //         it("should not process unlock for an inexistant remittance", async function(){
    //             assert.expectRevert(exchangeshopInstance.unlockRemittance(password.key1, "test1", {from: owner}));
    //         });
    //     });

    //     describe("Withdraw funds back (Alice)", function(){
            
    //         it("should not withdraw funds if there are none", async function(){
    //             assert.expectRevert(exchangeshopInstance.withdrawFundsBack(key, {from: owner}));
    //         });
    //         //think about it
    //         it("should not process withdraw if it is before the deadline", async function(){
    //             assert.expectRevert(exchangeshopInstance.withdrawFundsBack(key, {from: owner}));
    //         });

    //         it("should not withdraw funds back if the message sender is not the remittance owner", async function(){
    //             assert.expectRevert(exchangeshopInstance.withdrawFundsBack(key, {from: owner}));
    //         });
    //     });

    //     describe("Withdraw funds (Bob)", function(){
    //         it("should not create remittance with ", async function(){
                
    //         });
    //     });

    //     describe("Destroy", function(){
    //         it("should not destroy contract if the owner is not the destroyer", async function(){
    //             assert.expectRevert(exchangeshopInstance.destroy({from: alice}));
    //         });
    //     });
    // });
});
