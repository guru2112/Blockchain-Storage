// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FileStorage {
    
    struct File {
        string cid;
        string filename;
        uint256 timestamp;
    }

    mapping(address => File[]) private userFiles;

    // Upload file metadata
    function uploadFile(string memory _cid, string memory _filename) public {
        userFiles[msg.sender].push(
            File({
                cid: _cid,
                filename: _filename,
                timestamp: block.timestamp
            })
        );
    }

    // Get files of current user
    function getMyFiles() public view returns (File[] memory) {
        return userFiles[msg.sender];
    }

    // Delete file metadata by index
    function deleteFile(uint256 index) public {
        require(index < userFiles[msg.sender].length, "Invalid index");

        uint256 lastIndex = userFiles[msg.sender].length - 1;
        if (index != lastIndex) {
            userFiles[msg.sender][index] = userFiles[msg.sender][lastIndex];
        }

        userFiles[msg.sender].pop();
    }
}
