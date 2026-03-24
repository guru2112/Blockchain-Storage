# Decentralized Drive

Simplified Google Drive-style storage powered by IPFS, wallet ownership, and local encryption. Files are encrypted in the browser, pinned to IPFS via Pinata, and indexed on-chain by a Solidity smart contract.

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- ethers.js
- Pinata IPFS API
- Hardhat (Solidity)

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_APP_SECRET=your_app_secret
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
```

## Smart Contract

Deploy the `FileStorage` contract in `contracts/contracts/FileStorage.sol` using Hardhat, then set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the deployed address.

## Run the App

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Files are encrypted before upload. Direct IPFS links will show encrypted data only.
- Wallet signatures derive the encryption key: `SHA256(signature + APP_SECRET)`.
- For MetaMask on another device over LAN (e.g. `http://192.168.x.x:3000`), wallet injection can fail on insecure HTTP origins. Use HTTPS for network URLs, or test via `localhost` on the same device.
