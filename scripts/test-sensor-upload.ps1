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
  -Body $body |
  ConvertTo-Json -Depth 8
