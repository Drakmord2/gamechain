/*
Implements EIP20 token standard: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
.*/


pragma solidity ^0.4.21;

// import "./EIP20Interface.sol";


contract gamechain {

    // uint256 constant private MAX_UINT256 = 2**256 - 1;
    mapping (address => address[]) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    address[] public totalSupply;
    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show.
    string public symbol;                 //An identifier: eg SBX
    address public printerAuthority;

    function gamechain(
        string _tokenName,
        string _tokenSymbol
    ) public {
        // address[] asset_list;
        // balances[msg.sender] = asset_list;      // Initialize with no assets
        // address[] totalSupply;                  // Update total supply
        name = _tokenName;                      // Set the name for display purposes
        // decimals = 2;                           // Amount of decimals for display purposes
        symbol = _tokenSymbol;                  // Set the symbol for display purposes
        // printerAuthority = msg.sender;
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
        // emit Transfer(msg.sender, _to, _assetid); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    // function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    //     uint256 allowance = allowed[_from][msg.sender];
    //     require(balances[_from] >= _value && allowance >= _value);
    //     balances[_to] += _value;
    //     balances[_from] -= _value;
    //     if (allowance < MAX_UINT256) {
    //         allowed[_from][msg.sender] -= _value;
    //     }
    //     // emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
    //     return true;
    // }

    function balanceOf(address _owner) public view returns (address[] balance) {
        return balances[_owner];
    }

    // function approve(address _spender, uint256 _value) public returns (bool success) {
    //     allowed[msg.sender][_spender] = _value;
    //     emit Approval(msg.sender, _spender, _value); //solhint-disable-line indent, no-unused-vars
    //     return true;
    // }

    // function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    //     return allowed[_owner][_spender];
    // }
    
    function createAsset(address _receiver, address _assetid) public returns (bool success) {
        // if(msg.sender != printerAuthority) {
        //     return false;
        // }
        
        totalSupply.push(_assetid);
        balances[_receiver].push(_assetid);
        
        return true;
    }
    
    function burnAsset(address _assetid) public returns (bool success) {
        // if(msg.sender != printerAuthority) {
        //     return false;
        // }

        bool ownsAsset = false;
        uint bLength = balances[msg.sender].length;
        for (uint i=0; i<bLength; i++) {
          if (balances[msg.sender][i] == _assetid) {
            ownsAsset = true;
            break;
          }
        }
        require(ownsAsset);
        
        // require(balances[msg.sender] >= _value);
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