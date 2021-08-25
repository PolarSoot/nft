//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

contract StakingGameMock {
    struct UserProgress {
        uint256 choice1;
        uint256 choice2;
        uint256 choice3;
        bool ready; // started playing the game (sacrificed susu)
        bool participated; // entered the party and performed the role
    }

    address[] internal _players;
    mapping(address => UserProgress) internal _progress;

    constructor() {
        // rejects
        _createPlayer(address(1), UserProgress(0, 0, 0, false, false));
        _createPlayer(address(2), UserProgress(1, 0, 0, true, false));
        _createPlayer(address(3), UserProgress(1, 1, 1, true, false));

        // players
        _createPlayer(address(4), UserProgress(1, 1, 1, true, true));
        _createPlayer(address(5), UserProgress(1, 1, 2, true, true));
        _createPlayer(address(6), UserProgress(1, 2, 1, true, true));
        _createPlayer(address(7), UserProgress(1, 2, 2, true, true));

        _createPlayer(address(8), UserProgress(2, 1, 1, true, true));
        _createPlayer(address(9), UserProgress(2, 1, 2, true, true));
        _createPlayer(address(10), UserProgress(2, 2, 1, true, true));
        _createPlayer(address(11), UserProgress(2, 2, 2, true, true));

        //stowaways
        _createPlayer(address(12), UserProgress(1, 0, 0, true, true));
        _createPlayer(address(13), UserProgress(0, 0, 0, true, true));
        _createPlayer(address(14), UserProgress(0, 0, 0, false, true));
    }

    function _createPlayer(address player, UserProgress memory _p) internal {
        _players.push(player);
        _progress[player] = _p;
    }

    function players(uint256 _p) external view returns (address) {
        return _players[_p];
    }

    function getStatus(address _player)
        external
        view
        returns (UserProgress memory progress)
    {
        progress = _progress[_player];
    }

    // ppl who started the game
    // doesn't mean they finished it
    function numPlayers() external view returns (uint256) {
        return _players.length;
    }
}
