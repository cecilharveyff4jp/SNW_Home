$lines = Get-Content -Path "d:\Next.js\cecilharveyff4jp\snw-map\src\app\page.tsx" -Encoding UTF8
$newLines = @()

# 1-271行目まで
$newLines += $lines[0..270]

# 空行
$newLines += ""

# 描画順コメント
$newLines += "    // Draw order"

# 280-294行目
$newLines += $lines[279..293]

# フラット描画コード
$newLines += ""
$newLines += "      // Flat rectangle rendering"
$newLines += "      ctx.save();"
$newLines += "      ctx.fillStyle = th.top;"
$newLines += "      ctx.fillRect(gx, gy, gw, gh);"
$newLines += '      ctx.strokeStyle = th.stroke || "rgba(0,0,0,0.2)";'
$newLines += "      ctx.lineWidth = 2;"
$newLines += "      ctx.strokeRect(gx, gy, gw, gh);"
$newLines += "      ctx.restore();"
$newLines += ""
$newLines += "      // Selection ring"

# 311行目以降
$newLines += $lines[310..1038]

# ファイルに保存
$newLines | Set-Content -Path "d:\Next.js\cecilharveyff4jp\snw-map\src\app\page.tsx" -Encoding UTF8

Write-Host "Done"
