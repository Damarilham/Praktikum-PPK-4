$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"test@example.com","password":"password123"}' -ContentType "application/json" -WebSession $session | Out-Null
$body = '{"bulan":9,"tahun":2026,"nominal":1500000}'
Invoke-WebRequest -Uri "http://localhost:3000/api/budget" -Method POST -Body $body -ContentType "application/json" -WebSession $session -UseBasicParsing