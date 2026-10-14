# Midnight at Mel's
No-engine game: plain HTML5 Canvas + JS, all art and sound generated in code.
Play now: open index.html in any browser.

## Windows EXE
cd desktop && cp ../index.html ../art.js ../cams.js ../game.js . && npm install && npm run build-win
-> desktop/dist/MidnightAtMels-win32-x64/MidnightAtMels.exe

## Android APK
Option A: open the android/ folder in Android Studio -> Build > Build APK(s).
Option B: push this folder to GitHub; the Actions workflow builds both the exe and the apk (Actions tab > Artifacts).
