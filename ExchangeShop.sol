pragma solidity ^0.4.16;
import "./ValidExchangeShop.sol";

contract ExchangeShop is ValidExchangeShop {

    function ExchangeShop(uint deadlineLimit) public {
        this.deadlineLimit = deadlineLimit;
        owner = msg.sender;
    }

    function withdrawCommission() public onlyOwner onlyPositiveCommissionAmount {
        uint currentCommission = commissionsAmount;
        commissionsAmount = 0;
        owner.transfer(currentCommission);

        LogWitgdrawCommission(currentCommission);
    }

    function addCurrency(bytes32 name, uint commission) public onlyOwner onlyValidCurrency(name) {
        currencies[name] = commission;    

        LogNewCurrency(name, commission);
    }

    function addRemittance(uint deadline, bytes32 key, address to, bytes32 currency) public payable 
    onlyInDeadline(deadline) only onlyInexistentKey(key) onlyValidTo(to) onlyValidCurrency(currency) 
    {
        Remittance memory remittance = Remittance({
                                                    amount: convertTo(msg.value, currency),
                                                    to: to,
                                                    deadline: block.number + deadline,
                                                    owner: msg.sender
                                                 });

        lockedRemittances[key] = remittance;
        LogNewRemmitance(remittance);
    }

    function convertTo(uint amount, bytes32 currency) private view returns(uint convertedAmount) {
        uint commission = (amount * currencies[currency]) / 100;
        commissionsAmount += commission;
        return amount - commission;
    }

    function unlockRemittance(bytes32 pass1, bytes32 pass2) public onlyOwner onlyExistentKey(pass1, pass2) {
        bytes32 key = keccak256(pass1, pass2);
        address to = lockedRemmitances[key].to;
        unlockedRemittances[unlockedRemittances] += lockedRemmitances[key].amount;
        lockedRemmitances[key].amount = 0;

        LogUnlock(key);
    }

    function withdrawFundsBack(bytes32 key) public onlyPositiveFunds(key) onlyAfterDeadline(key) onlyRemittanceOwner(key) {
        uint remittanceAmount = lockedRemittances[key].amount;
        lockedRemittances[key].amount = 0;
        msg.sender.transfer(remittanceAmount);

        LogWithdrawFundsBack(msg.sender, remittanceAmount);
    }

    function withdrawFunds() public {
        uint remittanceAmount = unlockedRemittances[msg.sender];
        unlockedRemittances[msg.sender] = 0;
        msg.sender.transfer(remittanceAmount);
        
        LogWithdrawFunds(msg.sender, remittanceAmount);
    }

    function destroy() public onlyOwner {
        LogDestruction(msg.sender);

        selfdestruct(owner);
    }    
}