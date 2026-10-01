@echo off
rem Instala o actualiza el servicio de impresion ESC/POS del totem.
rem Solo hay que abrir este archivo con doble clic (no necesita .NET).
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/jarrin-kevin/Demo-TUTTOFREDO/claude/tuttofredo-payment-totem-16yzp8/kiosko/instalar-impresora.ps1 | iex"
pause
