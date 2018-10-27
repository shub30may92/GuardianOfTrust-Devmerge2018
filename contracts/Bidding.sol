pragma solidity ^0.4.2;

contract Bidding {

    struct Candidate {
        bool hasWithdrawn;
        bool hasDeposited;
        address depositer;
    }
    
    struct Cycle {
        uint month;
        bool isWithdrawn;
        address withdrawer; // address of withdrawer
        uint amountWithdrawn;
        uint amountRmaining;
        uint amountDeposited;
    }

    uint private amount; // constant
    uint private totalDeposit; // constant
    uint private totalUsers;
    address private ownerAddress;
    uint public numOfCandidates;
    uint private cycleNumber;


    mapping( uint => Candidate ) public candidates;
    mapping( uint => Cycle ) public cycles;

    constructor () public {
        ownerAddress = msg.sender;
        totalUsers = 3;
        amount = 5;
        totalDeposit = 15;
        startCycle();
    }

    
    
    function deposit() payable public {
        // chk if user has not already deposited
        // makes deposit to the particular month cycle
        // ownerAddress.transfer(amount);
        numOfCandidates++;
        candidates[numOfCandidates].depositer = msg.sender;
                candidates[numOfCandidates].hasWithdrawn = false;
        candidates[numOfCandidates].hasDeposited = true;
        cycles[cycleNumber].amountDeposited = cycles[cycleNumber].amountDeposited + amount;
    }

    function withdraw(uint _amount) public {
        uint candidateId = 0;
        for(uint i=1; i<=numOfCandidates; i++) {
            if(candidates[i].depositer == msg.sender){
                candidateId = i;
                break;
            }
        }
        require(!cycles[cycleNumber].isWithdrawn);
        require(candidateId>0);
        require(candidates[candidateId].hasDeposited);
        require(totalDeposit == cycles[cycleNumber].amountDeposited);  // check if all users have deposited
        msg.sender.transfer(toWei(_amount));
        candidates[candidateId].hasWithdrawn = true;
        cycles[cycleNumber].isWithdrawn = true;
        cycles[cycleNumber].withdrawer = msg.sender;
        cycles[cycleNumber].amountWithdrawn = _amount;
        cycles[cycleNumber].amountRmaining = totalDeposit - _amount;
        distribute();
        clean();
        startCycle();
    }

    function distribute() private {
        uint amountToBeDistriuted = toWei(cycles[cycleNumber].amountRmaining)/(numOfCandidates-1);
        for(uint i=1; i<=numOfCandidates; i++) {
            if(candidates[i].hasWithdrawn == false){
                candidates[i].depositer.transfer(amountToBeDistriuted);
            }
        }

    }
    
    function toWei(uint _eth) private pure returns (uint256 result) {
         result = _eth * (1 ether);
    }
    
    function clean() private {
        for(uint i=1; i<=numOfCandidates; i++) {
            candidates[i].hasWithdrawn = false;
            candidates[i].hasDeposited = false;
            candidates[i].depositer = 0;
        }
    }
    
    function startCycle() private {
        cycleNumber++;
        cycles[cycleNumber].month = cycleNumber;
        cycles[cycleNumber].isWithdrawn = false;
        cycles[cycleNumber].withdrawer = 0;
        cycles[cycleNumber].amountDeposited = 0;
        cycles[cycleNumber].amountWithdrawn = 0;
        cycles[cycleNumber].amountRmaining = 0;
    }
    
}

