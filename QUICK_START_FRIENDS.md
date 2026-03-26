# Friends Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Deploy Updated Smart Contract
```bash
# 1. Ensure your FileStorage.sol is updated with friend functions
# 2. Compile
npx hardhat compile

# 3. Deploy
npx hardhat run scripts/deploy.js --network <your-network>

# 4. Copy new contract address
# Example: 0x1234567890123456789012345678901234567890
```

### Step 2: Update Environment
```bash
# Edit .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourNewContractAddress
# (Keep other env vars the same)
```

### Step 3: Restart Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

✅ **Friends feature is now active!**

---

## 👥 Using the Friends Feature

### To Add a Friend
1. Click **"Friends" tab** in Dashboard (or **"👥 Friends"** button in navbar)
2. Click **"+ Send Friend Request"** button
3. Enter wallet address: `0x...`
4. Click **"Send Request"**

### To Accept/Reject Requests
1. Go to **Friends** > **Pending Requests** tab
2. See incoming requests
3. Click **Accept** or **Reject**

### To Share File with Friend
1. Go to **My Files** tab
2. Click **Share** on any file
3. Select **"Share with Friend"** toggle
4. Pick friend from dropdown
5. Click **Share** ✓

### To Manage Friends
1. Go to **Friends** > **Friends** tab
2. See your confirmed friends
3. Use search to find
4. Click **Remove** to unfriend (one-way)

---

## 🔔 Notifications

You'll see notification badges for:
- **Pending Shares**: Red badge showing count of incoming file requests
- **Friends**: Red badge showing count of pending friend requests

Badges auto-refresh every 30 seconds.

---

## 📁 Files & Changes

### New Files (8 total)
```
lib/blockchain/friendsManager.ts          ← Backend friend functions
components/sharing/FriendsManagement.tsx  ← Main UI component
components/sharing/SendFriendRequest.tsx  ← Request modal
components/sharing/PendingRequests.tsx    ← Requests list
components/sharing/FriendsList.tsx        ← Friends list
components/sharing/FriendsSelector.tsx    ← Dropdown selector
FRIENDS_FEATURE_GUIDE.md                  ← Full documentation
IMPLEMENTATION_SUMMARY.md                 ← Changes summary
```

### Modified Files (3 total)
```
contracts/contracts/FileStorage.sol       ← Smart contract updates
components/modals/ShareFileModal.tsx      ← Share modal enhancement
components/layout/Navbar.tsx              ← Added Friends button
app/dashboard/page.tsx                    ← Added Friends tab + badges
```

---

## 🧪 Quick Test

### Test Case 1: Basic Flow (5 min)
1. Open app with Wallet A
2. Send friend request to Wallet B address
3. Switch to Wallet B (change MetaMask account)
4. Refresh page, see pending request
5. Accept request
6. Both see each other in friends list ✓

### Test Case 2: File Sharing (5 min)
1. As Wallet A, upload a file
2. Click Share, select "Share with Friend" tab
3. Pick Wallet B from dropdown
4. Click Share
5. Switch to Wallet B
6. Go to "Shared With Me" tab
7. See shared file ✓

### Test Case 3: Remove Friend (2 min)
1. Go to Friends tab
2. See friend in list
3. Click Remove
4. Friend removed from your list ✓
5. Switch to other wallet
6. They still have you as friend (one-way) ✓

---

## ⚠️ Common Issues

### "Contract address not found"
→ Check `NEXT_PUBLIC_CONTRACT_ADDRESS` in .env.local

### "Friend request not found"
→ Request may have been accepted/rejected. Refresh page.

### "Pending requests not showing"
→ You may not have pending requests yet. Send a friend request first.

### Friends dropdown empty
→ You don't have any friends yet. Accept some friend requests first.

### Badges not updating
→ Badges auto-update every 30 seconds. Or refresh page.

---

## 📊 Feature Breakdown

| Feature | Status | Location |
|---------|--------|----------|
| Send Friend Request | ✅ | Friends tab > "+ Send Request" |
| Pending Requests | ✅ | Friends tab > "Pending" subtab |
| Accept/Reject | ✅ | Pending Requests view |
| Friends List | ✅ | Friends tab > "Friends" subtab |
| Remove Friend | ✅ | Friends List > Remove button |
| Share with Friend | ✅ | File share modal > "Share with Friend" |
| Notifications | ✅ | Dashboard tab badges |
| Search Friends | ✅ | Friends list search bar |

---

## 🔐 Security Notes

✓ Wallet-based authentication (no passwords)
✓ All data stored on blockchain (decentralized)
✓ Request-based system prevents spam
✓ One-way removal gives user control
✓ Encrypted file transfers (existing system)

---

## 📝 Next Steps

1. ✅ Deploy contract
2. ✅ Update env variables
3. ✅ Test features
4. ✅ Show to users

**Ready to go!** 🎉

---

## 💡 Pro Tips

- **Batch Friends**: Import/export friend lists (future feature)
- **Search Wallets**: Can search by address in Friends list
- **One-way Control**: Remove friend without affecting them
- **File History**: All shares tracked on blockchain
- **No Re-entry**: Once added, click Share > pick friend > done!

---

**Need help?** See FRIENDS_FEATURE_GUIDE.md for detailed documentation.
