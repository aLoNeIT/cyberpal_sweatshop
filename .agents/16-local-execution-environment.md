# 本地执行环境注意事项

本文档记录本机 Windows 环境下执行 PowerShell 脚本、命令时的注意事项。

## 1. PowerShell 中文编码

- Windows PowerShell 5 执行包含中文的 `.ps1` 时，必须使用 `Get-Content -Raw -Encoding UTF8` 后 `Invoke-Expression`，避免中文编码损坏。
- 直接通过管道或内联方式传递中文参数时，优先使用 UTF-8 编码。

## 2. PowerShell 保留变量

- 不要使用 `$pid` 作为变量名，PowerShell 中 `$PID` 是只读保留变量，赋值会报错。
- 其他常见保留变量：`$HOME`、`$PROFILE`、`$PSVersionTable`、`$Error`、`$_`、`$args` 等，避免覆盖。

## 3. 数组参数构造

- 在 PowerShell 中调用函数构造数组时，每个函数调用应用括号包住，例如 `(P 'state' 'int' '状态码' 0 '0')`，避免输出中出现 `Array` 字面量。

## 4. 脚本文件管理

- 执行脚本太长时，优先使用系统临时目录（`$env:TEMP`）落盘执行。
- 若临时放在项目目录中，任务结束前必须删除，避免污染版本库。
- 推荐使用 `.tmp/` 目录（已在 `.gitignore` 忽略列表中）存放临时脚本。
