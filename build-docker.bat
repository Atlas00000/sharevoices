@echo off
echo Building Docker images for SharedVoices microservices...

REM Build the content service
echo Building content-service...
docker-compose build content-service
if %ERRORLEVEL% neq 0 (
    echo Error building content-service
    exit /b %ERRORLEVEL%
)

REM Build the user service
echo Building user-service...
docker-compose build user-service
if %ERRORLEVEL% neq 0 (
    echo Error building user-service
    exit /b %ERRORLEVEL%
)

REM Build the notification service
echo Building notification-service...
docker-compose build notification-service
if %ERRORLEVEL% neq 0 (
    echo Error building notification-service
    exit /b %ERRORLEVEL%
)

REM Build the interaction service
echo Building interaction-service...
docker-compose build interaction-service
if %ERRORLEVEL% neq 0 (
    echo Error building interaction-service
    exit /b %ERRORLEVEL%
)

echo All services built successfully!
echo You can now run 'docker-compose up' to start the services.
