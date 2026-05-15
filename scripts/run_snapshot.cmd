@echo off
REM Snapshot wrapper invoked by the Strategy Lab launcher (start_dashboard.vbs).
REM cd to the project root (script lives in scripts/, project is one level up),
REM then run the snapshot pipeline, capturing all output to snapshot.log.
cd /d "%~dp0\.."
echo === run_snapshot.cmd fired at %DATE% %TIME% === > snapshot.log
call npm run snapshot >> snapshot.log 2>&1
echo === finished at %DATE% %TIME% === >> snapshot.log
