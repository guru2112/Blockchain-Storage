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
        uint256 fileSize; // Added to track storage
    }

    struct PendingShare {
        address sender;
        uint256 fileIndex;
        uint256 timestamp;
    }

    mapping(address => File[]) private userFiles;
    mapping(address => mapping(uint256 => Folder)) private userFolders;
    mapping(address => uint256) private nextFolderId;
    mapping(address => mapping(address => uint256[])) private sharedFiles;
    mapping(address => PendingShare[]) private pendingShares;
    mapping(address => mapping(address => bool)) private hasAcceptedShare;

    mapping(address => mapping(address => bool)) public isConnected;
    mapping(address => address[]) public userConnections;
    mapping(address => address[]) public pendingConnectionRequests;
    mapping(address => mapping(address => bool)) public hasPendingConnectionRequest;

    mapping(address => string) public usernames;
    mapping(address => string) public profilePictures; 

    // Storage Limitation Trackers
    mapping(address => uint256) public usedStorage;
    mapping(address => uint256) public storageLimit;
    
    uint256 public constant DEFAULT_LIMIT = 262144000; // 250 MB in bytes

    event ConnectionRequested(address indexed from, address indexed to);
    event ConnectionAccepted(address indexed from, address indexed to);
    event ProfilePictureUpdated(address indexed user, string cid);

    constructor() {}

    modifier checkStorageLimit(uint256 _fileSize) {
        uint256 limit = storageLimit[msg.sender] == 0 ? DEFAULT_LIMIT : storageLimit[msg.sender];
        require(usedStorage[msg.sender] + _fileSize <= limit, "Storage limit exceeded");
        _;
    }

    function setUsername(string memory _username) public {
        usernames[msg.sender] = _username;
    }

    function getUsername(address _user) public view returns (string memory) {
        return usernames[_user];
    }

    function setProfilePicture(string memory _cid) public {
        profilePictures[msg.sender] = _cid;
        emit ProfilePictureUpdated(msg.sender, _cid);
    }

    function getProfilePicture(address _user) public view returns (string memory) {
        return profilePictures[_user];
    }

    function sendConnectionRequest(address _to) public {
        require(_to != msg.sender, "Cannot connect with yourself");
        require(!isConnected[msg.sender][_to], "Already connected");
        require(!hasPendingConnectionRequest[_to][msg.sender], "Request already sent");

        pendingConnectionRequests[_to].push(msg.sender);
        hasPendingConnectionRequest[_to][msg.sender] = true;

        emit ConnectionRequested(msg.sender, _to);
    }

    function acceptConnectionRequest(address _from) public {
        require(hasPendingConnectionRequest[msg.sender][_from], "No pending request");

        isConnected[msg.sender][_from] = true;
        isConnected[_from][msg.sender] = true;

        userConnections[msg.sender].push(_from);
        userConnections[_from].push(msg.sender);

        hasPendingConnectionRequest[msg.sender][_from] = false;
        _removePendingConnectionRequest(msg.sender, _from);

        emit ConnectionAccepted(_from, msg.sender);
    }

    function _removePendingConnectionRequest(address _user, address _requester) internal {
        uint length = pendingConnectionRequests[_user].length;
        for (uint i = 0; i < length; i++) {
            if (pendingConnectionRequests[_user][i] == _requester) {
                pendingConnectionRequests[_user][i] = pendingConnectionRequests[_user][length - 1];
                pendingConnectionRequests[_user].pop();
                break;
            }
        }
    }

    function getPendingConnectionRequests() public view returns (address[] memory) {
        return pendingConnectionRequests[msg.sender];
    }

    function getConnections() public view returns (address[] memory) {
        return userConnections[msg.sender];
    }

    // --- Folders (FIXED ID LOGIC) ---
    function createFolder(string memory _name, uint256 _parentId) public returns (uint256) {
        // FIX: Force IDs to start at 1 so Root (0) is never overwritten or hidden
        if (nextFolderId[msg.sender] == 0) {
            nextFolderId[msg.sender] = 1;
        }
        
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

    function getMyFolders() public view returns (Folder[] memory) {
        uint256 count = 0;
        uint256 maxId = nextFolderId[msg.sender];
        if (maxId == 0) maxId = 1; // Prevent logic errors if completely empty
        
        // FIX: Start loop from 1
        for (uint256 i = 1; i < maxId; i++) {
            if (userFolders[msg.sender][i].exists) {
                count++;
            }
        }
        
        Folder[] memory folders = new Folder[](count + 1);
        folders[0] = Folder({id: 0, name: "Root", parentId: 0, exists: true});
        
        uint256 index = 1;
        // FIX: Start loop from 1
        for (uint256 i = 1; i < maxId; i++) {
            if (userFolders[msg.sender][i].exists) {
                folders[index] = userFolders[msg.sender][i];
                index++;
            }
        }
        
        return folders;
    }

    function renameFolder(uint256 _folderId, string memory _newName) public {
        require(userFolders[msg.sender][_folderId].exists, "Folder not found");
        require(_folderId != 0, "Cannot rename root folder");
        userFolders[msg.sender][_folderId].name = _newName;
    }

    function deleteFolder(uint256 _folderId) public {
        require(userFolders[msg.sender][_folderId].exists, "Folder not found");
        require(_folderId != 0, "Cannot delete root folder");
        
        for (uint256 i = 0; i < userFiles[msg.sender].length; ) {
            if (userFiles[msg.sender][i].folderId == _folderId) {
                usedStorage[msg.sender] -= userFiles[msg.sender][i].fileSize;
                
                uint256 lastIndex = userFiles[msg.sender].length - 1;
                if (i != lastIndex) {
                    userFiles[msg.sender][i] = userFiles[msg.sender][lastIndex];
                }
                userFiles[msg.sender].pop();
            } else {
                i++;
            }
        }
        
        userFolders[msg.sender][_folderId].exists = false;
    }

    // --- Files ---
    function uploadFile(string memory _cid, string memory _filename, uint256 _folderId, uint256 _fileSize) public checkStorageLimit(_fileSize) {
        if (_folderId != 0) {
            require(userFolders[msg.sender][_folderId].exists, "Folder not found");
        }
        
        userFiles[msg.sender].push(
            File({
                cid: _cid,
                filename: _filename,
                timestamp: block.timestamp,
                folderId: _folderId,
                fileSize: _fileSize
            })
        );
        
        usedStorage[msg.sender] += _fileSize; 
    }

    function getMyFiles() public view returns (File[] memory) {
        return userFiles[msg.sender];
    }

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

    function renameFile(uint256 index, string memory _newName) public {
        require(index < userFiles[msg.sender].length, "Invalid index");
        userFiles[msg.sender][index].filename = _newName;
    }

    function deleteFile(uint256 index) public {
        require(index < userFiles[msg.sender].length, "Invalid index");

        usedStorage[msg.sender] -= userFiles[msg.sender][index].fileSize;

        uint256 lastIndex = userFiles[msg.sender].length - 1;
        if (index != lastIndex) {
            userFiles[msg.sender][index] = userFiles[msg.sender][lastIndex];
        }
        userFiles[msg.sender].pop();
    }

    function getFileByIndex(address _user, uint256 _index) public view returns (File memory) {
        require(_index < userFiles[_user].length, "Invalid index");
        return userFiles[_user][_index];
    }

    // --- Sharing ---
    function sharePendingFileWith(address recipient, uint256 fileIndex) public {
        require(fileIndex < userFiles[msg.sender].length, "Invalid file index");
        require(recipient != address(0), "Invalid recipient");
        
        pendingShares[recipient].push(PendingShare({
            sender: msg.sender,
            fileIndex: fileIndex,
            timestamp: block.timestamp
        }));
    }

    function getPendingShares() public view returns (PendingShare[] memory) {
        return pendingShares[msg.sender];
    }

    function acceptPendingShare(address sender, uint256 shareIndex) public {
        require(shareIndex < pendingShares[msg.sender].length, "Invalid share index");
        
        PendingShare memory pendingShare = pendingShares[msg.sender][shareIndex];
        require(pendingShare.sender == sender, "Share not from this sender");
        require(pendingShare.fileIndex < userFiles[sender].length, "Original file no longer exists");
        
        hasAcceptedShare[msg.sender][sender] = true;
        sharedFiles[msg.sender][sender].push(pendingShare.fileIndex);
        
        uint256 lastIndex = pendingShares[msg.sender].length - 1;
        if (shareIndex != lastIndex) {
            pendingShares[msg.sender][shareIndex] = pendingShares[msg.sender][lastIndex];
        }
        pendingShares[msg.sender].pop();
    }

    function rejectPendingShare(uint256 shareIndex) public {
        require(shareIndex < pendingShares[msg.sender].length, "Invalid share index");
        
        uint256 lastIndex = pendingShares[msg.sender].length - 1;
        if (shareIndex != lastIndex) {
            pendingShares[msg.sender][shareIndex] = pendingShares[msg.sender][lastIndex];
        }
        pendingShares[msg.sender].pop();
    }

    function shareFileWith(address recipient, uint256 fileIndex) public {
        require(fileIndex < userFiles[msg.sender].length, "Invalid file index");
        require(recipient != address(0), "Invalid recipient");
        sharedFiles[recipient][msg.sender].push(fileIndex);
    }

    function getSharedFiles(address owner) public view returns (File[] memory) {
        uint256[] storage indices = sharedFiles[msg.sender][owner];
        File[] memory files = new File[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            files[i] = userFiles[owner][indices[i]];
        }
        return files;
    }
}