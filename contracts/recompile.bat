@echo off
cd /d C:\Users\Aditya G Solaskar\Desktop\decentralized-storage\contracts
echo Cleaning cache...
rmdir /s /q cache
rmdir /s /q artifacts
echo Recompiling...
npx hardhat compile
pause
