@echo off
rem Abre el totem de Tutto Freddo en pantalla completa e imprime el ticket
rem directo en la impresora predeterminada de Windows, sin dialogo.
rem Antes: deja la impresora termica de 80 mm como predeterminada.

rem El totem lo sirve el servicio de impresion (kiosko/instalar-impresora.bat).
set "URL=http://127.0.0.1:5123/"
rem Perfil aparte: asi Chrome respeta los flags aunque haya otro Chrome abierto.
set "PERFIL=%LOCALAPPDATA%\TuttoFreddoKiosko"

rem Arranca el servicio si no esta abierto (sirve el totem e imprime).
set "SERVICIO=%LOCALAPPDATA%\TuttoFreddo\impresora\TuttoImpresora.exe"
tasklist /FI "IMAGENAME eq TuttoImpresora.exe" | find /I "TuttoImpresora.exe" >nul || (
  if exist "%SERVICIO%" ( start "" "%SERVICIO%" & timeout /t 3 /nobreak >nul ) else ( echo Primero instala el servicio con instalar-impresora.bat & pause & exit /b )
)

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk --kiosk-printing --user-data-dir="%PERFIL%" --autoplay-policy=no-user-gesture-required "%URL%"
) else (
  rem Sin Chrome: Microsoft Edge acepta los mismos flags.
  start "" msedge --kiosk "%URL%" --edge-kiosk-type=fullscreen --kiosk-printing --user-data-dir="%PERFIL%"
)
