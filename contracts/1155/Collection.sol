//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./extensions/HasSecondarySaleFees.sol";
import "./extensions/HasProxyRegistry.sol";
import "./ERC1155Base.sol";

contract Collection is
    AccessControl,
    ERC1155Base,
    HasSecondarySaleFees,
    HasProxyRegistry
{
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    string public constant VERSION = "1";

    struct Token {
        uint256 totalSupply;
        uint256 maxSupply;
        address creator;
        bool locked;
    }

    string public name;
    string public symbol;
    uint8 public decimals = 18;

    bool public initialized;

    mapping(uint256 => Token) public token;

    event Lock(uint256 indexed id);
    event Create(uint256 indexed id, address indexed creator);

    constructor(
        address owner,
        address admin,
        address minter,
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        string memory _tokenURIPrefix,
        string memory _tokenURIPostfix,
        IDMode _idMode,
        address _proxyRegistryAddress
    )
        ERC1155Base(_contractURI, _tokenURIPrefix, _tokenURIPostfix, _idMode)
        HasProxyRegistry(_proxyRegistryAddress)
    {
        initialized = true;

        name = _name;
        symbol = _symbol;

        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE);
        _setRoleAdmin(MINTER_ROLE, OWNER_ROLE);

        _setupRole(OWNER_ROLE, owner);
        _setupRole(ADMIN_ROLE, admin);
        _setupRole(MINTER_ROLE, minter);
    }

    function create(
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

    function mint(
        address _account,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) external onlyRole(MINTER_ROLE) {
        require(_amount > 0, "Collection::mint: amount zero");

        _mint(_account, _id, _amount, _data);
    }

    function mintBatch(
        address _account,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) external onlyRole(MINTER_ROLE) {
        _mintBatch(_account, _ids, _amounts, _data);
    }

    function setTokenURIPrefix(string memory tokenURIPrefix)
        external
        onlyRole(ADMIN_ROLE)
    {
        _setTokenURIPrefix(tokenURIPrefix);
    }

    function setTokenURIPostfix(string memory tokenURIPostfix)
        external
        onlyRole(ADMIN_ROLE)
    {
        _setTokenURIPostfix(tokenURIPostfix);
    }

    function setContractURI(string memory contractURI)
        external
        onlyRole(ADMIN_ROLE)
    {
        _setContractURI(contractURI);
    }

    function updateProxyRegistryAddress(address _proxyRegistryAddress)
        external
        onlyRole(ADMIN_ROLE)
    {
        _updateProxyRegistryAddress(_proxyRegistryAddress);
    }

    function isApprovedForAll(address _owner, address _operator)
        public
        view
        override
        returns (bool isOperator)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        if (isProxy(_owner, _operator)) {
            return true;
        }

        return ERC1155Base.isApprovedForAll(_owner, _operator);
    }

    /**
     * @dev Makes max supply == total supply preventing from minting any more tokens
     * Careful! Can only be called once and there is no turning back.
     */
    function lock(uint256 _id) public onlyRole(ADMIN_ROLE) {
        require(!token[_id].locked, "Collection::lock: already");
        token[_id].locked = true;
        token[_id].maxSupply = token[_id].totalSupply;

        emit Lock(_id);
    }

    function exists(uint256 _id) public view returns (bool) {
        return token[_id].maxSupply > 0 && token[_id].creator != address(0);
    }

    function totalSupply(uint256 _id) public view returns (uint256) {
        return token[_id].totalSupply;
    }

    function maxSupply(uint256 _id) public view returns (uint256) {
        return token[_id].maxSupply;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC1155Base, HasSecondarySaleFees)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _onSingleTokenTransfer(
        address, /*operator*/
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory /*data*/
    ) internal override {
        if (from == address(0)) {
            require(
                token[id].totalSupply + amount <= token[id].maxSupply,
                "Collection::txhook: mint max reached"
            );
            token[id].totalSupply += amount;
        }

        if (to == address(0)) {
            token[id].totalSupply -= amount;
        }
    }
}
