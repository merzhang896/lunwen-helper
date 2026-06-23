# 部署脚本
$SERVER_IP = "211.154.28.7"
$SERVER_PORT = "11862"
$USERNAME = "administrator"
$PASSWORD = "aaa.6235"
$PROJECT_DIR = "lunwen-helper"

# 创建临时部署目录
New-Item -ItemType Directory -Path "deploy_temp" -Force

# 复制前端构建文件
Copy-Item -Path "dist" -Destination "deploy_temp\dist" -Recurse -Force

# 复制服务器文件
Copy-Item -Path "server" -Destination "deploy_temp\server" -Recurse -Force

# 复制根目录文件
Copy-Item -Path "package.json" -Destination "deploy_temp\"
Copy-Item -Path "package-lock.json" -Destination "deploy_temp\"

# 显示部署信息
Write-Host "部署准备完成，准备上传到服务器 $SERVER_IP`:$SERVER_PORT" -ForegroundColor Green
Write-Host "按任意键开始部署..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# 开始部署
Write-Host "使用SCP上传文件到服务器..." -ForegroundColor Yellow

# 注意：这里使用scp命令上传文件
scp -r "deploy_temp" "$USERNAME@$SERVER_IP`:~/$PROJECT_DIR"

# 显示服务器上需要执行的命令
Write-Host "\n在服务器上执行以下命令：" -ForegroundColor Cyan
Write-Host "1. cd $PROJECT_DIR"
Write-Host "2. npm install"
Write-Host "3. cd server"
Write-Host "4. npm install"
Write-Host "5. node server.js"

Write-Host "\n部署脚本执行完成！" -ForegroundColor Green