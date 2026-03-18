@echo off
echo =======================================
echo Pripremam datoteke za GitHub i Vercel...
echo =======================================
git add .
git commit -m "Automatsko azuriranje promjena"
git push
echo.
echo =======================================
echo 🎉 Git hub je azuriran! Sve je online! 🎉
echo =======================================
pause