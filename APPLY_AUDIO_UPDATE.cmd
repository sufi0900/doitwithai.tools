@echo off
setlocal EnableDelayedExpansion
if "%~1"=="" (
  echo Usage: APPLY_AUDIO_UPDATE.cmd "C:\Users\sufia\doitwithai-audio-work"
  exit /b 2
)
set "TARGET=%~1"
if not exist "%TARGET%\package.json" (
  echo Target folder "%TARGET%" does not contain package.json. Pass your repository root path.
  exit /b 1
)
pushd "%TARGET%" || exit /b 2
git config --global --add safe.directory "%TARGET:\=/%" >nul 2>nul
git config --global --add safe.directory "%TARGET%" >nul 2>nul

echo Copying updated Article-to-MP3, Article-to-PDF, and Article-to-Word files into "%TARGET%"...
for /f "usebackq delims=" %%F in ("%~dp0CHANGED_FILES.txt") do (
  set "REL=%%F"
  set "WINREL=!REL:/=\!"
  for %%D in ("%TARGET%\!WINREL!") do (
    if not exist "%%~dpD" mkdir "%%~dpD"
  )
  copy /Y "%~dp0updated-source\!WINREL!" "%TARGET%\!WINREL!" >nul
  if errorlevel 1 (
    echo Failed to copy !WINREL!
    popd
    exit /b 1
  )
)

echo.
echo All updated files copied successfully! Current git status:
git status --short
echo.
echo Next steps to commit and push:
echo   git add -- app features public scripts tests docs
echo   git diff --cached --stat
echo   git commit -m "Upgrade article audio neural voices and move download controls to top"
echo   git push origin HEAD:feat/homepage-tools-learning
popd
exit /b 0
