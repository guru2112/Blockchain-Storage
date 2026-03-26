# 🔧 Fix: Contract Functions Not Found

## The Issue
Your frontend is trying to call functions (`sendFriendRequest`, `getFriendsList`, etc.) that don't exist on the deployed contract yet. This is because **the contract hasn't been redeployed** with the new friend functions.

## The Solution (3 Steps)

### Step 1: Compile the Updated Contract

Open terminal/command prompt in the `contracts` folder:

```bash
cd contracts
npx hardhat compile
```

Expected output:
```
Compilation successful!
```

### Step 2: Deploy the New Contract

**For Localhost (Local Testing):**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**For Sepolia Testnet:**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

This will output something like:
```
✅ Contract deployed to: 0x1234567890123456789012345678901234567890
📝 Update your .env.local with:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

**⚠️ SAVE THIS ADDRESS! You'll need it next.**

### Step 3: Update ABI and Environment

After deployment, you need to:

1. **Find the new ABI** (the compiled contract interface)
   - Location: `contracts/artifacts/contracts/FileStorage.sol/FileStorage.json`
   - Copy the entire `"abi"` array from this file

2. **Update the ABI file**
   - Open: `lib/blockchain/abi.json` (in root project)
   - Replace ALL contents with the new ABI array
   - Save

3. **Update contract address**
   - Open: `.env.local` (in root project)
   - Find: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`
   - Replace with the new address from Step 2
   - Example:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
     ```
   - Save

### Step 4: Restart Development Server

```bash
npm run dev
```

---

## Verification

After restarting, try:
1. Go to Friends tab
2. Click "+ Send Friend Request"
3. Enter a wallet address
4. Click "Send Request"

✅ Should work now!

---

## If Still Getting Errors

Check:
- [ ] Contract deployed successfully (Step 2)
- [ ] New contract address copied correctly
- [ ] .env.local updated with new address
- [ ] ABI file updated with new ABI
- [ ] Development server restarted (npm run dev)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)

---

## Quick Commands

### All in One (if using localhost):

```bash
# Terminal 1: Start hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy contract
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
# Copy the address shown

# Terminal 3: Update files (see Step 3 above)
# Then restart your dev server
cd ..
npm run dev
```

---

That's it! The errors should be gone. 🎉
