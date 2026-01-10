# SNW Map

インタラクティブなマップアプリケーション

## 🎯 機能

- **マップ表示**: 等角投影ビューで3Dライクなマップを表示
- **オブジェクト管理**: マップ上にオブジェクトを配置・編集
- **誕生日機能**: メンバーの誕生日を表示、当月の誕生日には紙吹雪アニメーション
- **テロップ表示**: 誕生日情報を流れるテロップで表示
- **リンク集**: 外部リンクの管理機能
- **背景画像**: カスタマイズ可能な背景画像設定
- **ダークモード対応**: ライト/ダークテーマの切り替え
- **レスポンシブデザイン**: PC・スマホ両対応
- **編集モード**: パスワード認証による編集機能

## 🚀 技術スタック

- **Framework**: Next.js 15.1.3
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Deployment**: GitHub Pages

## 📦 セットアップ

### 必要な環境

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/cecilharveyff4jp/SNW_Home.git
cd SNW_Home

# 依存関係をインストール
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Google Apps Script URL（データ保存用）
NEXT_PUBLIC_GAS_URL=your_gas_url_here

# 編集モードパスワード
NEXT_PUBLIC_EDIT_PASSWORD=your_password_here
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
npm run build
```

## 📱 使い方

### 基本操作

- **パン（移動）**: マウスドラッグ / スマホでスワイプ
- **ズーム**: マウスホイール / ピンチイン・アウト
- **オブジェクト選択**: クリック/タップでオブジェクト情報を表示

### 編集モード

1. ヘッダーの編集ボタンをクリック
2. パスワードを入力
3. オブジェクトの追加・編集・削除が可能に

### マイオブジェクト機能

特定のオブジェクトを「マイオブジェクト」として設定すると、ページ読み込み時にそのオブジェクトを中心に表示します。

## 📂 プロジェクト構造

```
snw-map/
├── src/
│   └── app/
│       ├── page.tsx          # メインコンポーネント
│       ├── layout.tsx         # レイアウト
│       └── globals.css        # グローバルスタイル
├── public/                    # 静的ファイル
├── scripts/
│   └── Code.gs               # Google Apps Script
└── SNW_map.json              # マップデータ（開発用）
```

## 🔧 カスタマイズ

### マップデータ

`SNW_map.json` でマップの設定を変更できます：

- `cols`: マップの列数
- `rows`: マップの行数
- `cellSize`: セルのサイズ（ピクセル）
- `bgImage`: 背景画像ファイル名
- `bgCenterX/Y`: 背景画像の中心位置
- `bgScale`: 背景画像の拡大率
- `bgOpacity`: 背景画像の透明度

### オブジェクトタイプ

サポートされているオブジェクトタイプ：
- `HQ`: 本拠地（4x4、青色）
- `CITY`: 都市（2x2、紫色）
- `STATUE`: 像（2x2、緑色）
- `DEPOT`: デポ（2x2、茶色）
- `BEAR_TRAP`: 罠（オレンジ色）
- `MOUNTAIN`: 山（グレー）
- `LAKE`: 湖（青色）
- `FLAG`: フラッグ（1x1）

## 📄 ライセンス

このプロジェクトは個人用途のプロジェクトです。

## 👤 作成者

**cecilharveyff4jp**
- GitHub: [@cecilharveyff4jp](https://github.com/cecilharveyff4jp)
- Email: cecil.harvey.ff4.jp@gmail.com

## 🔗 デプロイ

GitHub Pagesで自動デプロイされます。masterブランチへのプッシュで自動的にデプロイが開始されます。
