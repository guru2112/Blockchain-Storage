# Delete all unnecessary documentation and script files

Write-Host "Cleaning up unnecessary files..." -ForegroundColor Yellow

# Delete extra .md files (keep only README.md)
Remove-Item -Force PROJECT_STRUCTURE.md -ErrorAction SilentlyContinue
Remove-Item -Force ORGANIZATION_GUIDE.md -ErrorAction SilentlyContinue
Remove-Item -Force STRUCTURE_VISUAL_GUIDE.md -ErrorAction SilentlyContinue
Remove-Item -Force STRUCTURE_REORGANIZATION_PLAN.md -ErrorAction SilentlyContinue
Remove-Item -Force QUICK_START_GUIDE.md -ErrorAction SilentlyContinue
Remove-Item -Force README_STRUCTURE.md -ErrorAction SilentlyContinue
Remove-Item -Force START_HERE.md -ErrorAction SilentlyContinue
Remove-Item -Force CLEANUP_SUMMARY.md -ErrorAction SilentlyContinue
Remove-Item -Force CLAUDE.md -ErrorAction SilentlyContinue
Remove-Item -Force AGENTS.md -ErrorAction SilentlyContinue

# Delete extra .ps1 script files (keep only cleanup.bat and reorganize.bat)
Remove-Item -Force POWERSHELL_COMMANDS.ps1 -ErrorAction SilentlyContinue
Remove-Item -Force LINT_FIX_COMMANDS.ps1 -ErrorAction SilentlyContinue
Remove-Item -Force DELETE_OLD_FILES.ps1 -ErrorAction SilentlyContinue
Remove-Item -Force FINAL_CLEANUP.ps1 -ErrorAction SilentlyContinue

# Delete old reorganization scripts
Remove-Item -Force reorganize.js -ErrorAction SilentlyContinue
Remove-Item -Force reorganize.py -ErrorAction SilentlyContinue
Remove-Item -Force reorganize_project.bat -ErrorAction SilentlyContinue
Remove-Item -Force full_reorganize.bat -ErrorAction SilentlyContinue
Remove-Item -Force reorganize_structure.bat -ErrorAction SilentlyContinue
Remove-Item -Force create_dirs.bat -ErrorAction SilentlyContinue

# Delete .eslintignore (not needed)
Remove-Item -Force .eslintignore -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "`nFiles remaining:" -ForegroundColor Cyan
Write-Host "  - README.md (project documentation)" -ForegroundColor White
Write-Host "  - cleanup.bat (cleanup utilities)" -ForegroundColor White
Write-Host "  - reorganize.bat (structure setup)" -ForegroundColor White

# Commit changes
git add .
git commit -m "cleanup: remove unnecessary documentation and scripts

- Keep only README.md for project documentation
- Keep only essential .bat files (cleanup.bat, reorganize.bat)
- Remove all extra .md documentation files
- Remove temporary PowerShell scripts
- Remove .eslintignore (not needed with modern ESLint)"

git push origin Blockchain4

Write-Host "`n✅ Cleanup committed and pushed!" -ForegroundColor Green
