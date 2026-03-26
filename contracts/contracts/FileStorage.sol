// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract FileStorage {
    
    struct Folder {
        uint256 id;
        string name;
        uint256 parentId;
        bool exists;
    }
    
    struct File {
        string cid;
        string filename;
        uint256 timestamp;
        uint256 folderId;
    }

    struct PendingShare {
        address sender;
        uint256 fileIndex;
        uint256 timestamp;
    }

    struct FriendRequest {
        address requester;
        uint256 timestamp;
    }

    mapping(address => File[]) private userFiles;
    mapping(address => mapping(uint256 => Folder)) private userFolders;
    mapping(address => uint256) private nextFolderId;
    mapping(address => mapping(address => uint256[])) private sharedFiles;
    mapping(address => PendingShare[]) private pendingShares;
    mapping(address => mapping(address => bool)) private hasAcceptedShare;
    
    // Friend management mappings
    mapping(address => address[]) private friendsList;
    mapping(address => FriendRequest[]) private pendingFriendRequests;
    mapping(address => mapping(address => bool)) private isFriend;
    
    // User profile mappings
    mapping(address => string) private userNames;

    // Events
    event FriendRequestSent(address indexed from, address indexed to, uint256 timestamp);
    event FriendRequestAccepted(address indexed user1, address indexed user2, uint256 timestamp);
    event FriendRequestRejected(address indexed user, address indexed requester, uint256 timestamp);
    event FriendRemoved(address indexed user, address indexed friend, uint256 timestamp);
    event UserNameSet(address indexed user, string name, uint256 timestamp);

    constructor() {
        // Root folder (id=0) always exists for all users
    }

    // Create a new folder
    function createFolder(string memory _name, uint256 _parentId) public returns (uint256) {
        uint256 folderId = nextFolderId[msg.sender];
        
        userFolders[msg.sender][folderId] = Folder({
            id: folderId,
            name: _name,
            parentId: _parentId,
            exists: true
        });
        
        nextFolderId[msg.sender]++;
        return folderId;
    }

    // Get a specific folder
    function getFolder(uint256 _folderId) public view returns (Folder memory) {
        require(userFolders[msg.sender][_folderId].exists || _folderId == 0, "Folder not found");
        
        if (_folderId == 0) {
            return Folder({
                id: 0,
                name: "Root",
                parentId: 0,
                exists: true
            });
        }
        
        return userFolders[msg.sender][_folderId];
    }

    // Get all folders (limited to prevent gas limits)
    function getMyFolders() public view returns (Folder[] memory) {
        uint256 count = 0;
        uint256 maxId = nextFolderId[msg.sender];
        
        for (uint256 i = 0; i < maxId; i++) {
            if (userFolders[msg.sender][i].exists) {
                count++;
            }
        }
        
        Folder[] memory folders = new Folder[](count + 1);
        folders[0] = Folder({id: 0, name: "Root", parentId: 0, exists: true});
        
        uint256 index = 1;
        for (uint256 i = 0; i < maxId; i++) {
            if (userFolders[msg.sender][i].exists) {
                folders[index] = userFolders[msg.sender][i];
                index++;
            }
        }
        
        return folders;
    }

    // Upload file metadata to a folder
    function uploadFile(string memory _cid, string memory _filename, uint256 _folderId) public {
        // Folder 0 (root) is always valid, or folder must exist
        if (_folderId != 0) {
            require(userFolders[msg.sender][_folderId].exists, "Folder not found");
        }
        
        userFiles[msg.sender].push(
            File({
                cid: _cid,
                filename: _filename,
                timestamp: block.timestamp,
                folderId: _folderId
            })
        );
    }

    // Get files of current user (all or by folder)
    function getMyFiles() public view returns (File[] memory) {
        return userFiles[msg.sender];
    }

    // Get files in specific folder
    function getFilesInFolder(uint256 _folderId) public view returns (File[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < userFiles[msg.sender].length; i++) {
            if (userFiles[msg.sender][i].folderId == _folderId) {
                count++;
            }
        }
        
        File[] memory folderFiles = new File[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userFiles[msg.sender].length; i++) {
            if (userFiles[msg.sender][i].folderId == _folderId) {
                folderFiles[index] = userFiles[msg.sender][i];
                index++;
            }
        }
        
        return folderFiles;
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

    // Delete a folder (cascading delete of files)
    function deleteFolder(uint256 _folderId) public {
        require(userFolders[msg.sender][_folderId].exists, "Folder not found");
        require(_folderId != 0, "Cannot delete root folder");
        
        // Delete all files in this folder
        for (uint256 i = 0; i < userFiles[msg.sender].length; ) {
            if (userFiles[msg.sender][i].folderId == _folderId) {
                uint256 lastIndex = userFiles[msg.sender].length - 1;
                if (i != lastIndex) {
                    userFiles[msg.sender][i] = userFiles[msg.sender][lastIndex];
                }
                userFiles[msg.sender].pop();
            } else {
                i++;
            }
        }
        
        // Mark folder as deleted
        userFolders[msg.sender][_folderId].exists = false;
    }

    // Share a file with another address (creates pending share)
    function sharePendingFileWith(address recipient, uint256 fileIndex) public {
        require(fileIndex < userFiles[msg.sender].length, "Invalid file index");
        require(recipient != address(0), "Invalid recipient");
        
        pendingShares[recipient].push(PendingShare({
            sender: msg.sender,
            fileIndex: fileIndex,
            timestamp: block.timestamp
        }));
    }

    // Get all pending shares for current user
    function getPendingShares() public view returns (PendingShare[] memory) {
        return pendingShares[msg.sender];
    }

    // Accept a pending share
    function acceptPendingShare(address sender, uint256 shareIndex) public {
        require(shareIndex < pendingShares[msg.sender].length, "Invalid share index");
        
        PendingShare memory pendingShare = pendingShares[msg.sender][shareIndex];
        require(pendingShare.sender == sender, "Share not from this sender");
        require(pendingShare.fileIndex < userFiles[sender].length, "Original file no longer exists");
        
        // Mark as accepted and add to permanent shared files
        hasAcceptedShare[msg.sender][sender] = true;
        sharedFiles[msg.sender][sender].push(pendingShare.fileIndex);
        
        // Remove from pending by swapping with last element
        uint256 lastIndex = pendingShares[msg.sender].length - 1;
        if (shareIndex != lastIndex) {
            pendingShares[msg.sender][shareIndex] = pendingShares[msg.sender][lastIndex];
        }
        pendingShares[msg.sender].pop();
    }

    // Reject a pending share
    function rejectPendingShare(uint256 shareIndex) public {
        require(shareIndex < pendingShares[msg.sender].length, "Invalid share index");
        
        // Remove from pending by swapping with last element
        uint256 lastIndex = pendingShares[msg.sender].length - 1;
        if (shareIndex != lastIndex) {
            pendingShares[msg.sender][shareIndex] = pendingShares[msg.sender][lastIndex];
        }
        pendingShares[msg.sender].pop();
    }

    // Share a file with another address (legacy - creates immediate share)
    function shareFileWith(address recipient, uint256 fileIndex) public {
        require(fileIndex < userFiles[msg.sender].length, "Invalid file index");
        require(recipient != address(0), "Invalid recipient");
        sharedFiles[recipient][msg.sender].push(fileIndex);
    }

    // Get files shared with the caller
    function getSharedFiles(address owner) public view returns (File[] memory) {
        uint256[] storage indices = sharedFiles[msg.sender][owner];
        File[] memory files = new File[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            files[i] = userFiles[owner][indices[i]];
        }
        return files;
    }

    // ==================== FRIEND MANAGEMENT FUNCTIONS ====================

    // Send a friend request to another user
    function sendFriendRequest(address recipient) public {
        require(recipient != address(0), "Invalid recipient address");
        
        // Check if already friends
        require(!isFriend[msg.sender][recipient], "Already friends with this address");
        
        // Check if already sent a request to this user
        for (uint256 i = 0; i < pendingFriendRequests[recipient].length; i++) {
            require(
                pendingFriendRequests[recipient][i].requester != msg.sender,
                "Friend request already sent to this address"
            );
        }
        
        pendingFriendRequests[recipient].push(FriendRequest({
            requester: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit FriendRequestSent(msg.sender, recipient, block.timestamp);
    }

    // Get all pending friend requests for current user
    function getPendingFriendRequests() public view returns (FriendRequest[] memory) {
        return pendingFriendRequests[msg.sender];
    }

    // Accept a friend request
    function acceptFriendRequest(address requester) public {
        require(requester != address(0), "Invalid requester address");
        
        // Find and remove the friend request
        uint256 requestIndex = type(uint256).max;
        for (uint256 i = 0; i < pendingFriendRequests[msg.sender].length; i++) {
            if (pendingFriendRequests[msg.sender][i].requester == requester) {
                requestIndex = i;
                break;
            }
        }
        
        require(requestIndex != type(uint256).max, "Friend request not found");
        
        // Add to both users' friend lists
        friendsList[msg.sender].push(requester);
        friendsList[requester].push(msg.sender);
        
        // Mark as friends
        isFriend[msg.sender][requester] = true;
        isFriend[requester][msg.sender] = true;
        
        // Remove from pending
        uint256 lastIndex = pendingFriendRequests[msg.sender].length - 1;
        if (requestIndex != lastIndex) {
            pendingFriendRequests[msg.sender][requestIndex] = pendingFriendRequests[msg.sender][lastIndex];
        }
        pendingFriendRequests[msg.sender].pop();
        
        emit FriendRequestAccepted(msg.sender, requester, block.timestamp);
    }

    // Reject a friend request
    function rejectFriendRequest(address requester) public {
        require(requester != address(0), "Invalid requester address");
        
        // Find and remove the friend request
        uint256 requestIndex = type(uint256).max;
        for (uint256 i = 0; i < pendingFriendRequests[msg.sender].length; i++) {
            if (pendingFriendRequests[msg.sender][i].requester == requester) {
                requestIndex = i;
                break;
            }
        }
        
        require(requestIndex != type(uint256).max, "Friend request not found");
        
        // Remove from pending
        uint256 lastIndex = pendingFriendRequests[msg.sender].length - 1;
        if (requestIndex != lastIndex) {
            pendingFriendRequests[msg.sender][requestIndex] = pendingFriendRequests[msg.sender][lastIndex];
        }
        pendingFriendRequests[msg.sender].pop();
        
        emit FriendRequestRejected(msg.sender, requester, block.timestamp);
    }

    // Get current user's friends list
    function getFriendsList() public view returns (address[] memory) {
        return friendsList[msg.sender];
    }

    // Check if two users are friends
    function areFriends(address user) public view returns (bool) {
        return isFriend[msg.sender][user];
    }

    // Remove a friend from your list (one-way removal)
    function removeFriend(address friend) public {
        require(friend != address(0), "Invalid friend address");
        require(isFriend[msg.sender][friend], "Not friends with this address");
        
        // Find and remove from current user's friends list
        uint256 friendIndex = type(uint256).max;
        for (uint256 i = 0; i < friendsList[msg.sender].length; i++) {
            if (friendsList[msg.sender][i] == friend) {
                friendIndex = i;
                break;
            }
        }
        
        require(friendIndex != type(uint256).max, "Friend not found in list");
        
        // Remove by swapping with last element
        uint256 lastIndex = friendsList[msg.sender].length - 1;
        if (friendIndex != lastIndex) {
            friendsList[msg.sender][friendIndex] = friendsList[msg.sender][lastIndex];
        }
        friendsList[msg.sender].pop();
        
        // Mark as not friends (only for current user)
        isFriend[msg.sender][friend] = false;
        
        emit FriendRemoved(msg.sender, friend, block.timestamp);
    }

    // Get friend count
    function getFriendCount() public view returns (uint256) {
        return friendsList[msg.sender].length;
    }

    // Get pending requests count
    function getPendingRequestCount() public view returns (uint256) {
        return pendingFriendRequests[msg.sender].length;
    }

    // ==================== USER PROFILE FUNCTIONS ====================

    // Set user's display name (name only, max 50 characters)
    function setUserName(string memory _name) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 50, "Name must be 50 characters or less");
        
        userNames[msg.sender] = _name;
        emit UserNameSet(msg.sender, _name, block.timestamp);
    }

    // Get user's display name
    function getUserName(address user) public view returns (string memory) {
        return userNames[user];
    }
}
