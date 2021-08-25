//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

interface IStakingGame {
    struct UserProgress {
        uint256 choice1;
        uint256 choice2;
        uint256 choice3;
        bool ready; // started playing the game (sacrificed susu)
        bool participated; // entered the party and performed the role
    }

    function players(uint256) external view returns (address);

    function getStatus(address _player)
        external
        view
        returns (UserProgress memory progress);

    function getPlayers() external view returns (address[] memory);

    function getStatuses() external view returns (UserProgress[] memory);

    // finished as in got a role, but not went to the party yet
    function finished(address _player) external view returns (bool);

    function participated(address _player) external view returns (bool);

    // ppl who started the game
    // doesn't mean they finished it
    function numPlayers() external view returns (uint256);

    // how many variation of choices were made
    function numChoices() external view returns (uint256);

    function queryDistribution()
        external
        view
        returns (
            uint256, // total players
            uint256, // total choices made
            bytes32[] memory, // selectors (choice types)
            uint256[] memory // choice count
        );
}

interface IStakingGameQuery {
    struct GameQuery {
        uint256 choice1;
        uint256 choice2;
        uint256 choice3;
        bool ready;
        bool participated;
        uint256 numPlayers;
        uint256 totalChoicesMade;
        bytes32 encodedChoice;
    }

    struct StatBreakdown {
        uint256 numParticipated;
        uint256 numStarted;
        uint256 numCompleted;
        uint256 num111;
        uint256 num112;
        uint256 num121;
        uint256 num122;
        uint256 num211;
        uint256 num212;
        uint256 num221;
        uint256 num222;
        uint256 num000;
    }

    function choiceEncode(
        uint256 one,
        uint256 two,
        uint256 three
    ) external pure returns (bytes32 selector);

    function statBreakdown(
        address game,
        uint256 _from,
        uint256 _to
    ) external view returns (StatBreakdown memory);

    function query(address game, address user)
        external
        view
        returns (
            GameQuery memory,
            bytes32[] memory,
            uint256[] memory
        );
}
