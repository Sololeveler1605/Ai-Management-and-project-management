# Start AI Project OS — FastAPI backend (8000) + React/Vite frontend (5173)
# Fixes "port already in use" / WinError 10013 / 10048 on Windows.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = "C:\Users\Piyush\anaconda3\python.exe"
$BackendPort = 8000
$FrontendPort = 5173

function Stop-PortListener([int]$Port) {
    $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
        if ($procId) {
            Write-Host "Stopping process on port ${Port}: PID $procId"
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Freeing ports $BackendPort and $FrontendPort..."
Stop-PortListener $BackendPort
Stop-PortListener $FrontendPort
Start-Sleep -Seconds 1

$backendCmd = "cd `"$Root\backend`"; & `"$Python`" -m uvicorn main:app --port $BackendPort --host 127.0.0.1"
$frontendCmd = "cd `"$Root\frontend`"; npm.cmd run dev -- --host 127.0.0.1 --port $FrontendPort"

Write-Host "Starting backend on http://127.0.0.1:$BackendPort ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null
Start-Sleep -Seconds 2

Write-Host "Starting React frontend on http://127.0.0.1:$FrontendPort ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host ""
Write-Host "Done."
Write-Host "  API:       http://127.0.0.1:$BackendPort"
Write-Host "  React:     http://127.0.0.1:$FrontendPort"
Write-Host ""
Write-Host "If you still see a socket error, do NOT start uvicorn twice."
Write-Host "Close the old terminal windows first, then run this script again."
