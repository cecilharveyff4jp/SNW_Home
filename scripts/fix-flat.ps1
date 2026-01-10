$lines = Get-Content -Path "d:\Next.js\cecilharveyff4jp\snw-map\src\app\page.tsx"
$newLines = @()

# 1-271行目まで
$newLines += $lines[0..270]

# 空行
$newLines += ""

# 描画順コメント
$newLines += "    // 描画順：奥→手前（y→x）で自然に重なる"

# 280-294行目（ソートとforループ開始）
$newLines += $lines[279..293]

# フラット描画コード
$newLines += ""
$newLines += "      // フラットな四角形を描画"
$newLines += "      ctx.save();"
$newLines += "      ctx.fillStyle = th.top;"
$newLines += "      ctx.fillRect(gx, gy, gw, gh);"
$newLines += '      ctx.strokeStyle = th.stroke || "rgba(0,0,0,0.2)";'
$newLines += "      ctx.lineWidth = 2;"
$newLines += "      ctx.strokeRect(gx, gy, gw, gh);"
$newLines += "      ctx.restore();"
$newLines += ""
$newLines += "      // 選択リング＆グロー"

# 311行目以降（選択リングのif文から最後まで）
$newLines += $lines[310..1038]

# ファイルに保存
$newLines | Set-Content -Path "d:\Next.js\cecilharveyff4jp\snw-map\src\app\page.tsx"

Write-Host "✅ 立体コードを削除してフラット描画に変更しました"
