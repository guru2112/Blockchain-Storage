@echo off
REM Reorganization Script - Creates new directory structure and moves files
REM Run this from the project root: reorganize.bat

echo ========================================
echo Project Structure Reorganization
echo ========================================
echo.

REM Create main directories
echo Creating directories...
if not exist "lib\utils" mkdir lib\utils
if not exist "lib\blockchain" mkdir lib\blockchain
if not exist "lib\hooks" mkdir lib\hooks
if not exist "lib\types" mkdir lib\types
if not exist "config" mkdir config
if not exist "docs" mkdir docs
if not exist "scripts" mkdir scripts

REM Create component subdirectories
echo Creating component subdirectories...
if not exist "components\layout" mkdir components\layout
if not exist "components\modals" mkdir components\modals
if not exist "components\file-management" mkdir components\file-management
if not exist "components\sharing" mkdir components\sharing

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Move files (manually or using these commands):
echo.
echo    REM Utilities
echo    move lib\auth.ts lib\utils\auth.ts
echo    move lib\wallet.ts lib\utils\wallet.ts
echo    move lib\crypto.ts lib\utils\crypto.ts
echo.
echo    REM Blockchain
echo    move lib\blockchain.ts lib\blockchain\index.ts
echo    move lib\contracts.ts lib\blockchain\contracts.ts
echo    move lib\abi.json lib\blockchain\abi.json
echo.
echo    REM Hooks
echo    move lib\useProtectHistory.ts lib\hooks\useProtectHistory.ts
echo.
echo    REM Docs and Scripts
echo    move cleanup.bat scripts\cleanup.bat
echo    move CLEANUP_SUMMARY.md docs\CLEANUP_SUMMARY.md
echo    move AGENTS.md docs\AGENTS.md
echo.
echo 2. Update imports in all files (search and replace):
echo    @/lib/auth -> @/lib/utils
echo    @/lib/wallet -> @/lib/utils
echo    @/lib/crypto -> @/lib/utils
echo    @/lib/useProtectHistory -> @/lib/hooks
echo.
echo 3. Create barrel export files (index.ts) in each subdirectory
echo.
echo 4. Run: npm run lint (to verify no import errors)
echo.
echo 5. Run: npm run build (to ensure everything compiles)
echo.
echo ========================================
echo Directories created successfully!
echo ========================================
echo.
pause
