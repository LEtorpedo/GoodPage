# 简化的安全测试脚本
# win 环境测试: powershell -ExecutionPolicy Bypass -File simple-security-test.ps1
# 1. 路径遍历攻击 - 读取系统文件
# 2. 命令注入攻击
# 3. URL 编码绕过攻击
# 4. 系统保留文件名攻击
# 5. 隐藏文件创建攻击

Write-Host "GoodPage 安全测试开始" -ForegroundColor Green

# 测试 1: 路径遍历攻击
Write-Host "`n测试 1: 路径遍历攻击 - 读取系统文件" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-dblp" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": "../../../etc/passwd"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 测试 2: Windows 路径遍历
Write-Host "`n测试 2: Windows 路径遍历攻击" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-yaml" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": "..\\..\\..\\windows\\system32\\config\\sam.yaml"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 测试 3: 命令注入攻击
Write-Host "`n测试 3: 命令注入攻击" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-dblp" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": "test.txt; cat /etc/passwd"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 测试 4: URL 编码绕过
Write-Host "`n测试 4: URL 编码绕过攻击" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-yaml" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd.yaml"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 测试 5: 系统保留文件名
Write-Host "`n测试 5: 系统保留文件名攻击" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-dblp" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": "CON.txt"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 测试 6: 隐藏文件创建
Write-Host "`n测试 6: 隐藏文件创建攻击" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/publications/import-yaml" -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"fileName": ".hidden_config.yaml"}' -ErrorAction Stop
    Write-Host "危险！攻击成功 - HTTP $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "攻击被阻止 - HTTP 400" -ForegroundColor Green
    } else {
        Write-Host "其他错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n安全测试完成" -ForegroundColor Green
