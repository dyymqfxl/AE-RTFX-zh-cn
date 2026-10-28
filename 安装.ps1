[CmdletBinding()]
param(
    [switch]$Restore,
    [string]$ExtensionPath = 'C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\RTFX extension'
)
$ErrorActionPreference = 'Stop'
function Get-Sha256([string]$FilePath) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($FilePath))).Replace('-', '') }
    finally { $sha.Dispose() }
}
$target = (Resolve-Path -LiteralPath $ExtensionPath).Path
$index = Join-Path $target 'index.html'
$backup = Join-Path $target 'index.html.rtfx-zh-v1.bak'
$marker = '<!-- RTFX-ZH-PATCH v1 -->'
$utf8 = New-Object System.Text.UTF8Encoding($false)
if (!(Test-Path -LiteralPath (Join-Path $target 'CSXS\manifest.xml'))) { throw '目标不是有效的 RTFX CEP 扩展目录。' }
$html = [IO.File]::ReadAllText($index)
$patched = $html.Contains($marker)
if ($Restore) {
    if (!$patched) { Write-Host '当前入口未启用本补丁，无需还原。'; exit 0 }
    if (!(Test-Path -LiteralPath $backup)) { throw '未找到原始入口备份，无法还原。' }
    $originalHtml = [IO.File]::ReadAllText($backup)
    if ($originalHtml.Contains($marker)) { throw '备份包含补丁标记，已停止还原以避免误覆盖。' }
    Copy-Item -LiteralPath $backup -Destination $index -Force
    Write-Host '已恢复安装前的原始入口。重启 AE 后生效。'
    exit 0
}
if (!$patched -and (Test-Path -LiteralPath $backup)) {
    $originalHash = (Get-Sha256 $backup)
    if ($originalHash -ne (Get-Sha256 $index)) {
        throw '发现旧备份且入口内容已变化；请先检查版本，未覆盖任何文件。'
    }
}
foreach ($file in @('js\script.js','js\install.js')) {
    if (!(Test-Path -LiteralPath (Join-Path $target $file))) { throw "缺少原始脚本：$file" }
}
$expected = @{
    'js\script.js' = '3C61EEA9019DA64879BF08B2C97542A937DB31F1174683B3DD3B6F91922BB081'
    'js\install.js' = '5F4C41B41FB451624B723A8EBE382A6A6AD2399DE926002AD0E2744DC62494D5'
}
foreach ($file in $expected.Keys) {
    if ((Get-Sha256 (Join-Path $target $file)) -ne $expected[$file]) {
        throw "版本校验失败：$file 与本机 RTFX 2.8.1 原版不一致，未安装补丁。"
    }
}
if ($patched) {
    if (!(Test-Path -LiteralPath $backup)) { throw '缺少原始入口备份，已停止安装。' }
    $oldJs = [IO.File]::ReadAllBytes((Join-Path $target 'js\rtfx-zh.js'))
    $oldCss = [IO.File]::ReadAllBytes((Join-Path $target 'css\rtfx-zh.css'))
    try {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'payload\rtfx-zh.js') -Destination (Join-Path $target 'js\rtfx-zh.js') -Force
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'payload\rtfx-zh.css') -Destination (Join-Path $target 'css\rtfx-zh.css') -Force
    } catch {
        [IO.File]::WriteAllBytes((Join-Path $target 'js\rtfx-zh.js'), $oldJs)
        [IO.File]::WriteAllBytes((Join-Path $target 'css\rtfx-zh.css'), $oldCss)
        throw
    }
    Write-Host '补丁已安装：汉化、分类高亮和红色收藏。重启 AE 后生效。'
    exit 0
}
if ($html -notmatch '(?i)</head>' -or $html -notmatch '(?i)</body>') { throw '原始入口结构不匹配。' }
Copy-Item -LiteralPath $index -Destination $backup -Force
$newHtml = $html -replace '(?i)</head>', ($marker + "`r`n" + '<link rel="stylesheet" href="css/rtfx-zh.css">' + "`r`n</head>")
$newHtml = $newHtml -replace '(?i)</body>', ('<script src="js/rtfx-zh.js"></script>' + "`r`n</body>")
try {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'payload\rtfx-zh.css') -Destination (Join-Path $target 'css\rtfx-zh.css') -Force
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'payload\rtfx-zh.js') -Destination (Join-Path $target 'js\rtfx-zh.js') -Force
    [IO.File]::WriteAllText($index, $newHtml, $utf8)
} catch {
    Copy-Item -LiteralPath $backup -Destination $index -Force
    throw
}
Write-Host '补丁安装完成：汉化、分类高亮和红色收藏。重启 AE 后生效。'
Write-Host "原始入口已备份：$backup"
