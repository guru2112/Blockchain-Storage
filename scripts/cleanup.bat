@echo off
REM Cleanup script to remove unused files from the project

echo Removing unused component files...
del /F /Q "components\FileList_backup.tsx"
del /F /Q "components\RenameFileModal.tsx"
del /F /Q "components\MoveFileModal.tsx"

echo Removing redundant documentation...
del /F /Q "CLAUDE.md"

echo.
echo Cleanup complete! The following files have been removed:
echo - components/FileList_backup.tsx
echo - components/RenameFileModal.tsx
echo - components/MoveFileModal.tsx
echo - CLAUDE.md
echo.
echo Next steps:
echo 1. Run: npm run lint
echo 2. Run: npm run build
echo 3. Test the application
echo.
pause
