# Cloud server deployment

Current production prototype:

```text
Website:
http://81.70.232.233:3000

Health:
http://81.70.232.233:3000/api/health

Sensor upload:
http://81.70.232.233:3000/api/sensor-data
```

## Quick test

PowerShell:

```powershell
$body = @{
  deviceId = "D-A01"
  location = "大雄宝殿配电箱 A 区"
  temperature = 34.2
  humidity = 33
  cableTemp = 73.6
  current = 19.8
  leakage = 36
  smoke = 430
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://81.70.232.233:3000/api/sensor-data" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

## Server maintenance

Tencent Cloud OrcaTerm:

```bash
pm2 status
pm2 logs heritage-fire-monitor
pm2 restart heritage-fire-monitor
```

If the server reboots and the service does not start automatically:

```bash
cd ~/heritage-fire-monitor
pm2 start backend/server.js --name heritage-fire-monitor
pm2 save --force
```

