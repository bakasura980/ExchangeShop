pragma solidity ^0.4.16;
import "./ValidExchangeShop.sol";

contract ExchangeShop is ValidExchangeShop {

    event LogDestruction(address destroyer);
    event LogUnlock(address withdrawer, uint amount);
    event LogNewRemmitance(address owner, address to, uint amount, uint deadline);
    event LogNewCurrency(bytes32 name, uint commission);
    event LogWithdrawFundsBack(address remittanceOwner, uint remittanceAmount);
    event LogWithdrawFunds(address remittanceOwner, uint remittanceAmunt);
    event LogWitgdrawCommission(uint commision);

    bytes32 public key;

    function ExchangeShop(uint maxDeadline) public {
        deadlineLimit = maxDeadline;
        owner = msg.sender;
    }

    function withdrawCommission() public onlyOwner {
        uint currentCommission = commissionsAmount;
        commissionsAmount = 0;
        owner.transfer(currentCommission);

        LogWitgdrawCommission(commissionsAmount);
    }

    function addCurrency(bytes32 name, uint commission) public onlyOwner onlyInExistentCurrency(name) {
        currencies[name] = commission;    

        LogNewCurrency(name, currencies[name]);
    }

    function addRemittance(uint deadline, bytes32 key, address to, bytes32 currency) public payable 
    onlyInDeadline(deadline) onlyInExistentKey(key) onlyValidTo(to) onlyExistentCurrency(currency) 
    {
        Remittance memory remittance = Remittance({
                                                    amount: convertTo(msg.value, currency),
                                                    to: to,
                                                    deadline: block.number + deadline,
                                                    owner: msg.sender,
                                                    isExists: true
                                                 });

        lockedRemittances[key] = remittance;

        LogNewRemmitance(lockedRemittances[key].owner, lockedRemittances[key].to, lockedRemittances[key].amount, lockedRemittances[key].deadline);
    }

    function convertTo(uint amount, bytes32 currency) private returns(uint convertedAmount) {
        uint commission = (amount * currencies[currency]) / 100;
        commissionsAmount += commission;
        return amount - commission;
    }
    //onlyExistentKey(pass1, pass2)
    function unlockRemittance(bytes32 pass1, bytes32 pass2) public onlyOwner {
        key = keccak256(pass1, pass2);
        // bytes32 key = keccak256(pass1, pass2);
        // address to = lockedRemittances[key].to;
        // unlockedRemittances[to] += lockedRemittances[key].amount;
        // delete lockedRemittances[key];

        // LogUnlock(to, unlockedRemittances[to]);
    }

    //check if it is already unlocked   
    function withdrawFundsBack(bytes32 key) public onlyAfterDeadline(key) onlyRemittanceOwner(key) {
        uint remittanceAmount = lockedRemittances[key].amount;
        lockedRemittances[key].amount = 0;
        msg.sender.transfer(remittanceAmount);
        delete lockedRemittances[key];
        
        LogWithdrawFundsBack(msg.sender, remittanceAmount);
    }

    function withdrawFunds() public {
        uint remittanceAmount = unlockedRemittances[msg.sender];
        unlockedRemittances[msg.sender] = 0;
        msg.sender.transfer(remittanceAmount);
        delete unlockedRemittances[msg.sender];
        
        LogWithdrawFunds(msg.sender, remittanceAmount);
    }

    function destroy() public onlyOwner {
        LogDestruction(msg.sender);

        selfdestruct(owner);
    }    
}
