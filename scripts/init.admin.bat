@echo off
chcp 1251
setlocal enabledelayedexpansion

:input_email
set /p "user_email=Enter email: "

if "%user_email%"=="" (
    echo Error: Email not be empty!
    goto input_email
)

echo Run: npm run initAdmin --email %user_email%
npm run initAdmin %user_email%


echo Well done, create email: %user_email%
pause
endlocal