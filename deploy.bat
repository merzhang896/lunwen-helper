@echo off

REM 部署脚本
set SERVER_IP=211.154.28.7
set SERVER_PORT=11862
set USERNAME=administrator
set PASSWORD=aaa.6235
set PROJECT_DIR=lunwen-helper

REM 创建临时部署目录
mkdir deploy_temp

REM 复制前端构建文件
xcopy /E /I dist deploy_temp/dist

REM 复制服务器文件
xcopy /E /I server deploy_temp/server

REM 复制根目录文件
copy package.json deploy_temp/
copy package-lock.json deploy_temp/

REM 显示部署信息
echo 部署准备完成，准备上传到服务器 %SERVER_IP%:%SERVER_PORT%
echo 按任意键开始部署...
pause >nul

REM 开始部署
REM 注意：这里需要使用SSH工具上传文件，比如WinSCP或pscp
echo 请使用SSH工具将 deploy_temp 目录上传到服务器
 echo 上传完成后，在服务器上执行以下命令：
echo 1. cd %PROJECT_DIR%
echo 2. npm install
echo 3. cd server
echo 4. npm install
echo 5. node server.js

echo 部署脚本执行完成！