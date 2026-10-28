# AE 脚本 RTFX 中文补丁

适用于 After Effects 中的 **RTFX Generator v2.8.1 Windows CEP 扩展**。

提供面板汉化、当前分类高亮和红色收藏星标，保留原版素材导入流程。

![RTFX 汉化面板预览](preview.png)

## 功能

- **面板汉化**：主分类、子分类、商店、收藏及常用按钮提示中文显示。
- **分类高亮**：当前选中分类显示深蓝底色、蓝色左侧标记和加粗文字，移开鼠标仍保持。
- **红色收藏**：已收藏素材的五角星显示红色，顶部收藏夹按钮激活时也显示红色。

## 安装

1. 先安装并确认原版 RTFX 可以正常打开。
2. 下载本仓库：点击 **Code → Download ZIP**，解压整个压缩包。请勿只下载 CMD 文件。
3. 保存工程并关闭 After Effects。
4. 右键 **安装补丁.cmd**，选择 **以管理员身份运行**。
5. 看到安装成功提示后，重新打开 AE 和原来的 RTFX 面板。

默认扩展目录：

```text
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\RTFX extension
```

脚本会检查原版前端脚本是否与补丁适配的版本一致，不匹配时停止安装。安装需要管理员权限，因为默认扩展位于系统目录。

### 安装到其他目录

在管理员 PowerShell 中进入本补丁目录后执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\安装.ps1" -ExtensionPath "D:\你的扩展目录\RTFX extension"
```

## 还原

1. 保存工程并关闭 AE。
2. 右键 **还原原版.cmd**，选择 **以管理员身份运行**。
3. 完成后重启 AE。

还原会使用首次安装时保存的 `index.html.rtfx-zh-v1.bak`，恢复原始入口，停止加载补丁。不要删除此备份。两个补丁资源文件会留在扩展目录中，但原始入口不再引用它们。

自定义目录还原：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\安装.ps1" -Restore -ExtensionPath "D:\你的扩展目录\RTFX extension"
```

## 文件

```text
安装补丁.cmd           安装补丁
还原原版.cmd           恢复安装前入口
安装.ps1               共用安装及还原脚本
payload/rtfx-zh.js      汉化与分类选择逻辑
payload/rtfx-zh.css     分类高亮与红色收藏样式
README.md              使用说明
preview.png            面板效果预览
```

## 说明

本仓库只提供补丁，不包含 RTFX 原版扩展、素材包或授权文件；请自行准备原版。

汉化范围为面板界面。素材文件名、预览内容中的英文、以及编译在 `.jsxbin` 内的 AE 原生对话框保持原样。搜索仍按英文素材名称。

如果安装提示版本校验失败，请确认扩展路径和版本，不要跳过校验强行安装。
