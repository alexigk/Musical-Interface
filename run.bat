@echo off

set SCRIPT_DIR=%~dp0

pushd %SCRIPT_DIR%\integration

if "%1"=="start" (
    docker-compose up -d
)

if "%1"=="start-build" (
    docker-compose up -d --build
)

if "%1"=="stop" (
    docker-compose down
)

popd
