@echo off
rem Abre el totem de Tutto Freddo en pantalla completa e imprime el ticket
rem directo en la impresora predeterminada de Windows, sin dialogo.
rem Antes: deja la impresora termica de 80 mm como predeterminada.

set "URL=https://jarrin-kevin.github.io/Demo-TUTTOFREDO/"
rem Perfil aparte: asi Chrome respeta los flags aunque haya otro Chrome abierto.
set "PERFIL=%LOCALAPPDATA%\TuttoFreddoKiosko"

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk --kiosk-printing --user-data-dir="%PERFIL%" --autoplay-policy=no-user-gesture-required "%URL%"
) else (
  rem Sin Chrome: Microsoft Edge acepta los mismos flags.
  start "" msedge --kiosk "%URL%" --edge-kiosk-type=fullscreen --kiosk-printing --user-data-dir="%PERFIL%"
)
