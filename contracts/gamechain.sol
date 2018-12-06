
pragma solidity ^0.4.21;

contract gamechain {

    mapping (address => address[]) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    address[] public totalSupply;

    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show.
    string public symbol;                 //An identifier: eg SBX
    address public printerAuthority;

    function gamechain(
        string _tokenName,
        string _tokenSymbol
    ) public {
        name = _tokenName;                      // Set the name for display purposes
        symbol = _tokenSymbol;                  // Set the symbol for display purposes
    }

    function transfer(address _to, address _assetid) public returns (bool success) {

        bool ownsAsset = false;
        uint arrayLength = balances[msg.sender].length;
        for (uint i=0; i<arrayLength; i++) {
          if (balances[msg.sender][i] == _assetid) {
            ownsAsset = true;
            break;
          }
        }
        require(ownsAsset);
        delete balances[msg.sender][i]; // Remove element from array
        balances[_to].push(_assetid);
        return true;
    }

    function balanceOf(address _owner) public view returns (address[] balance) {
        return balances[_owner];
    }
    
    function createAsset(address _receiver, address _assetid) public returns (bool success) {
        totalSupply.push(_assetid);
        balances[_receiver].push(_assetid);
        
        return true;
    }
    
    function burnAsset(address _assetid) public returns (bool success) {
        bool ownsAsset = false;
        uint bLength = balances[msg.sender].length;
        for (uint i=0; i<bLength; i++) {
          if (balances[msg.sender][i] == _assetid) {
            ownsAsset = true;
            break;
          }
        }
        require(ownsAsset);

        delete balances[msg.sender][i]; // Remove element from array

        uint tsLength = totalSupply.length;
        for (uint j=0; j<tsLength; j++) {
          if (totalSupply[j] == _assetid) {
            break;
          }
        }
        delete totalSupply[j]; // Remove element from array
        
        return true;
    }
}