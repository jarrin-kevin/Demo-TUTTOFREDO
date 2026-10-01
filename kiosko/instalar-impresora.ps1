# Instala o actualiza el servicio de impresion del totem Tutto Freddo.
# - Baja TuttoImpresora.zip del release "impresora" del repo.
# - Lo deja en %LOCALAPPDATA%\TuttoFreddo\impresora (respeta tu appsettings.json).
# - Lo arranca y lo agrega al inicio de Windows.
# No necesita .NET instalado: el .exe ya lo trae.

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$url     = 'https://github.com/jarrin-kevin/Demo-TUTTOFREDO/releases/download/impresora/TuttoImpresora.zip'
$destino = Join-Path $env:LOCALAPPDATA 'TuttoFreddo\impresora'
$zip     = Join-Path $env:TEMP 'TuttoImpresora.zip'
$exe     = Join-Path $destino 'TuttoImpresora.exe'
$config  = Join-Path $destino 'appsettings.json'

Write-Host 'Descargando el servicio de impresion...'
Get-Process TuttoImpresora -ErrorAction SilentlyContinue | Stop-Process -Force
Invoke-WebRequest $url -OutFile $zip -UseBasicParsing

New-Item -ItemType Directory -Force $destino | Out-Null
$configAnterior = $null
if (Test-Path $config) { $configAnterior = [IO.File]::ReadAllText($config) }
Expand-Archive $zip -DestinationPath $destino -Force
if ($configAnterior) { [IO.File]::WriteAllText($config, $configAnterior) }
Remove-Item $zip -Force

Write-Host 'Agregando al inicio de Windows...'
$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Startup')) 'Tutto Freddo Impresora.lnk'))
$acceso.TargetPath = $exe
$acceso.WorkingDirectory = $destino
$acceso.Save()

Start-Process $exe -WorkingDirectory $destino
Start-Sleep -Seconds 3
try {
    $estado = Invoke-RestMethod 'http://127.0.0.1:5123/estado'
    Write-Host ''
    Write-Host ('Listo. Imprime en: ' + $estado.impresora) -ForegroundColor Green
    Write-Host 'Ticket de prueba: abre http://127.0.0.1:5123/prueba en el navegador.'
} catch {
    Write-Host 'El servicio no respondio. Revisa que TuttoImpresora.exe este abierto.' -ForegroundColor Yellow
}
