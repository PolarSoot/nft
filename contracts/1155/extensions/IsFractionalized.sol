//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "../1155/Collection.sol";


contract IsFractionalized is Collection {
	function 
}

	function create(
	bool _fractionalized,
        address _account,
        uint256 _id,
        uint256 _initialSupply,
        uint256 _maxSupply,
        bytes memory _data,
        string memory _customUri,
        Fee[] memory _fees
    ) external onlyRole(ADMIN_ROLE) {
        require(!exists(_id), "Collection::create: already");

        if (_maxSupply == 0) {
            token[_id].maxSupply = type(uint256).max;
        } else {
            token[_id].maxSupply = _maxSupply;
        }

	token[_id].fractionalized = _fractionalized

        token[_id].creator = _msgSender();

        _mint(_account, _id, _initialSupply, _data);

        if (_fees.length > 0) {
            _setSecondarySaleFees(_id, _fees);
        }

        if (bytes(_customUri).length > 0) {
            _setCustomTokenURI(_id, _customUri);
        }

        emit Create(_id, _msgSender());
    }

    	
    	function getFractionalizedStatus(uint256 _id) public view returns (bool) {
		return token[_id].fractionalized
	}
