# 🔴 Troubleshooting: Contract Functions Not Found

## Error Summary
```
TypeError: contract.sendFriendRequest is not a function
TypeError: contract.getFriendsList is not a function
TypeError: contract.getPendingFriendRequests is not a function
TypeError: contract.getFriendCount is not a function
TypeError: contract.getPendingRequestCount is not a function
```

## Root Cause ✓
Your **frontend is trying to call functions that don't exist on the deployed contract**. This happens because:
1. Smart contract code was updated with new functions ✓
2. But the contract on Sepolia hasn't been redeployed ✗
3. Your app is trying to call non-existent functions on the old contract ✗

## Solution: Redeploy Contract

### Quick Version (TL;DR)

```bash
# 1. Go to contracts folder
cd contracts

# 2. Compile
npx hardhat compile

# 3. Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# 4. Copy the new contract address printed out

# 5. Update .env.local in root:
#    NEXT_PUBLIC_CONTRACT_ADDRESS=0x[NEW_ADDRESS]

# 6. Replace lib/blockchain/abi.json with new ABI from:
#    contracts/artifacts/contracts/FileStorage.sol/FileStorage.json

# 7. Restart dev server:
npm run dev
```

---

## Detailed Step-by-Step

### Prerequisites
- [ ] You have SEPOLIA_PRIVATE_KEY in `contracts/.env` (for signing transactions)
- [ ] You have SEPOLIA_RPC_URL in `contracts/.env`
- [ ] You have ETH on Sepolia testnet for gas fees

### Step 1: Verify Contract Code ✓

Open `contracts/contracts/FileStorage.sol` and verify these functions exist:
- [ ] `sendFriendRequest()`
- [ ] `acceptFriendRequest()`
- [ ] `rejectFriendRequest()`
- [ ] `getPendingFriendRequests()`
- [ ] `getFriendsList()`
- [ ] `removeFriend()`
- [ ] `getFriendCount()`
- [ ] `getPendingRequestCount()`

If not, your contract file wasn't updated. Check that the file has the friend functions added.

### Step 2: Compile Contract

```bash
cd contracts
npx hardhat compile
```

**Expected output:**
```
Compilation successful ✓
```

**If you get errors:**
- Check syntax in FileStorage.sol
- Ensure all function declarations are correct
- Make sure closing braces match

### Step 3: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected output:**
```
Deploying contract...
✅ Contract deployed to: 0x[LONG_HEX_ADDRESS]
📝 Update your .env.local with:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x[LONG_HEX_ADDRESS]
```

**⚠️ IMPORTANT: Copy the address!** You'll need it in the next step.

**Possible errors:**
- "Not enough balance for gas" → Get more testnet ETH
- "Private key not found" → Check `contracts/.env`
- "Network error" → Check internet/RPC URL

### Step 4: Extract New ABI

After successful deployment, the compiled contract is at:
```
contracts/artifacts/contracts/FileStorage.sol/FileStorage.json
```

1. Open this file
2. Find the `"abi"` array (it's a large JSON list)
3. Copy everything from `[` to `]` (the entire abi array)

### Step 5: Update ABI File

1. Open: `lib/blockchain/abi.json` (in root, not in contracts folder)
2. Select ALL content (Ctrl+A)
3. Replace with the new ABI from Step 4
4. Save

**Verify:**
- File should start with `[`
- File should end with `]`
- Should contain many function definitions
- Should include new friend functions

### Step 6: Update Contract Address

1. Open: `.env.local` (in root, not in contracts folder)
2. Find line: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x3B9bEDE6025e2226F3E5bb46152071962288B1D1`
3. Replace with new address from Step 3
4. Example:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890ABCDEF1234567890ABCDEF12345678
   ```
5. Save

### Step 7: Restart Development Server

```bash
npm run dev
```

Stop the old server first (Ctrl+C) if it's still running.

**Expected output:**
```
> next dev
Ready in 1.23s
```

### Step 8: Test in Browser

1. Go to http://localhost:3000
2. Login with MetaMask
3. Click "Friends" tab
4. Try "Send Friend Request"
5. Should work! ✓

---

## Verification Checklist

After following all steps:

- [ ] Contract compiled without errors
- [ ] Contract deployed to Sepolia (new address)
- [ ] ABI file updated with new abi.json
- [ ] .env.local has new contract address
- [ ] Dev server restarted
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] No errors in browser console
- [ ] Can access Friends feature
- [ ] Can send friend request without "is not a function" error

---

## Common Issues & Fixes

### Issue 1: "Contract deployed, but still getting errors"
**Solution:**
- [ ] Did you update `.env.local`?
- [ ] Did you restart `npm run dev`?
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh page (Ctrl+F5)

### Issue 2: "ABI file syntax error"
**Solution:**
- Ensure file starts with `[`
- Ensure file ends with `]`
- No extra characters before/after
- Don't edit ABI manually - copy from compiled contract

### Issue 3: "Cannot deploy - no balance"
**Solution:**
- Get testnet ETH from faucet
- Link: https://www.alchemy.com/faucets/ethereum-sepolia
- Wait for transaction to confirm
- Try deploying again

### Issue 4: "Compilation errors"
**Solution:**
- Check FileStorage.sol for syntax errors
- Verify all functions have closing braces
- Ensure no duplicate function names
- Check for missing semicolons

### Issue 5: "Still can't access Friend functions after all steps"
**Solution:**
1. Verify network ID matches (11155111 for Sepolia)
2. Verify contract address is correct (0x...)
3. Try connecting wallet again
4. Check that you're on correct network in MetaMask

---

## After Successful Deployment

Your Friends feature will work:
- ✅ Send friend requests
- ✅ View pending requests
- ✅ Accept/reject requests
- ✅ See friends list
- ✅ Share files with friends
- ✅ Get notifications

---

## Emergency: Revert Back

If something goes wrong:

```bash
# Use your old contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3B9bEDE6025e2226F3E5bb46152071962288B1D1

# Restore old ABI (if you saved it)
# Or use git to revert abi.json
git checkout lib/blockchain/abi.json

# Restart server
npm run dev
```

---

## Need More Help?

Check these files:
- FIX_CONTRACT_ERRORS.md - Simple fix guide
- QUICK_START_FRIENDS.md - Setup guide
- contracts/.env - Sepolia credentials
- .env.local - App configuration

---

**You're almost there! Just need to redeploy the contract.** 🚀
