@echo off
REM Snapshot wrapper invoked by the Strategy Lab launcher (start_dashboard.vbs).
REM cd to the project root (script lives in scripts/, project is one level up),
REM activate the shared trading-career venv so `python` resolves to the one
REM that has MetaTrader5 installed, then run the snapshot pipeline. All output
REM gets captured to snapshot.log.
cd /d "%~dp0\.."
echo === run_snapshot.cmd fired at %DATE% %TIME% === > snapshot.log
call "%~dp0..\..\.venv\Scripts\activate.bat" >> snapshot.log 2>&1
call npm run snapshot >> snapshot.log 2>&1
echo === finished at %DATE% %TIME% === >> snapshot.log
