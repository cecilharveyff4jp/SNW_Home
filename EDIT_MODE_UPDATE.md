# 編集モード改修 - 変更内容

## 実装日
2026年1月12日

## 変更内容

### 1. シングルクリック処理の改善
**ファイル**: `src/app/page.tsx`

- 編集モード時、空白エリアをクリックすると`pendingPosition`に座標を記録
- +マークの描画処理を追加（赤い十字マーク、影付き）

### 2. ダブルクリック処理の修正
- 空白エリアでのダブルクリック時に`setPendingPosition`を呼び出し
- 新規オブジェクト作成モーダルを自動で開くように修正
- `e.preventDefault()`と`e.stopPropagation()`を追加してイベント伝播を防止

### 3. 新規ボタンの動作改善
- クリック時に`pendingPosition`がなければマップ中央を設定
- `pendingPosition`がある場合はその座標を使用

### 4. 描画ロジックの追加
- `draw()`関数内に+マーク描画コードを追加
- カメラ座標変換を適用して正しい位置に表示
- 赤い+マーク（影付き、白い縁取り）

### 5. 再描画トリガーの追加
- useEffectの依存配列に`pendingPosition`を追加
- +マークの表示/非表示時に自動的に再描画

## 使用方法

### シングルクリックで+マーク表示
1. 編集モードに入る
2. 空白のマスをクリック
3. クリックした位置の中心に赤い+マークが表示される

### +マーク位置にオブジェクト作成
1. +マークを表示した状態
2. 「➕新規オブジェクト」ボタンをクリック
3. モーダルが開き、タイプを選択
4. 「追加」ボタンで+マーク位置にオブジェクト作成

### ダブルクリックで素早く作成
1. 編集モードに入る
2. 空白エリアをダブルクリック
3. 自動的にモーダルが開く
4. タイプを選択して「追加」

### Ctrl+クリックで即座に作成（従来通り）
1. 編集モードでCtrl+クリック
2. その場にFLAGタイプのオブジェクトを即座に作成

## 技術的な詳細

### pendingPosition の管理
```typescript
const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

// クリック時に設定
setPendingPosition({ x: gridX, y: gridY });

// オブジェクト作成後にクリア
setPendingPosition(null);
```

### +マーク描画コード
```typescript
if (isEditMode && pendingPosition) {
  ctx.save();
  const px = (pendingPosition.x + 0.5) * cfg.cell;
  const py = (pendingPosition.y + 0.5) * cfg.cell;
  
  // 赤い+マークを描画
  ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#ef4444";
  // ...
}
```

## テスト項目

- [x] シングルクリックで+マーク表示
- [x] +マーク位置に新規ボタンでオブジェクト作成
- [x] ダブルクリックで新規作成モーダル表示
- [x] Ctrl+クリックで即座に作成（既存機能）
- [x] オブジェクト作成後に+マークが消える
- [x] キャンセル時に+マークが消える
- [x] 編集モード終了時の動作確認

## 注意事項

- 参照モード（閲覧モード）では+マークは表示されません
- +マークはあくまで視覚的なガイドで、強制ではありません
- Ctrl+クリックは従来通り即座にFLAGを作成します
