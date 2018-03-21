pragma solidity ^0.4.16;

contract ValidExchangeShop {

    struct Remittance {
        uint amount;
        uint deadline;
        address to;
        address owner;        
    }

    address public owner;
    uint    public deadlineLimit;
    mapping(bytes32 => uint) public currencies;
    mapping(bytes32 => ExchangeRemittance) private lockedRemittances;
    mapping(address => uint) public unlockedRemittances;
    uint    private commissionsAmount;

    event LogDestruction(address destroyer);
    event LogUnlock(bytes32 key);
    event LogNewRemmitance(Remittance newRemittance);
    event LogNewCurrency(bytes32 name, uint commission);
    event LogWithdrawFundsBack(address remittanceOwner, uint remittanceAmount);
    event LogWithdrawFunds(address remittanceOwner, uint remittanceAmunt);
    event LogWitgdrawCommission(uint commision);

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    modifier onlyPositiveCommissionAmount() {
        require(commissionsAmount > 0);
        _;
    }

    modifier onlyInDeadline(uint deadline){
        require(deadline > 0 && deadline <= deadlineLimit);
        _;
    }

    modifier onlyPositiveFunds() {
        require(lockedremittances[key].amount > 0);
        _;
    }

    modifier onlyAfterDeadline(){
        require(block.number < lockedremittances[key].deadline);
        _;
    }

    modifier onlyExistentKey(bytes32 pass1, bytes32 pass2){
        require(lockedRemittances[keccak256(pass1, pass2)] != address(0));
        _;
    }

    modifier onlyInexistentKey(bytes32 key){
        require(lockedRemittances[key] == address(0) && key.length > 0);
        _;
    }

    modifier onlyValidTo(address to){
         require(to != address(0));
        _;
    }

    modifier onlyValidCurrency(bytes32 currency){
        require(currencies[currency] != address(0));
    }

    modifier onlyRemittanceOwner(key){
        require(lockedRemittances[key].owner == msg.senders);
        _;
    }

    modifier onlyValidCurrency(bytes32 name){
        require(currencies[name] == address(0) && name.length > 0);
        _;
    }
}