# 發放設定頁

直接以瀏覽器開啟 `index.html` 即可執行（不需建置工具；以 file:// 開啟或部署到伺服器皆可）。
畫面對應 Figma「設定頁面（發放設定）」。

## 檔案結構

```
Project Management/
├── index.html
├── css/
│   ├── variables.css      設計變數（色彩、字體、尺寸、圓角、陰影、動態）
│   ├── base.css           全域基礎樣式
│   ├── components.css     共用元件：金額欄位、下拉、勾選、單選、按鈕、提示
│   ├── layout.css         表單列、欄位名稱、底部操作列
│   └── settings.css       頁面區塊：項目名稱、補助對象、發送方式、發送設定、發送配置、預覽頁
└── js/
    ├── icons.js           SVG 圖示 sprite
    ├── utils.js           共用工具與小元件（勾選框、圖示按鈕、toast）
    ├── config.js          常數與預設資料（DEFAULTS）
    ├── components/
    │   └── amount-field.js 金額輸入框
    ├── sections/
    │   ├── item-name.js    項目名稱
    │   ├── subsidy.js      補助對象與金額
    │   ├── send-mode.js    發送方式（選項分配／固定選項）
    │   ├── send-methods.js 發送設定（各發送項目與金額）
    │   ├── combos.js       發送配置：狀態、組合計算、項目數選單、［配置］
    │   └── preview-page.js 預覽頁（員工端的領取方式選擇）
    ├── views/
    │   └── combo-list.js   發送配置的清單呈現
    └── main.js             進入點：驗證、確認／取消、初始化
```

腳本以 `defer` 依上述順序載入，全部掛在 `window.SettingsApp` 命名空間下。
未使用 ES module，是為了讓頁面直接以 file:// 開啟時也能執行。

## 命名規則

- class 一律 kebab-case，格式為「元件-子元素」：`combo-item`、`combo-name`
- 變體用 `--`：`btn-com--primary`、`row-inner--top`
- 狀態用 `is-`，由 JS 切換：`is-off`、`is-open`、`is-error`、`is-disabled`、`is-visible`、`is-placeholder`
- 顏色、尺寸等數值一律引用 `css/variables.css` 的變數
- JS 以 `id` 取得元素；請勿任意更名

## 發送方式的兩種模式

- **固定選項**（預設）：發送設定同樣可複選，隱藏「發送配置」；所有勾選項目合成唯一的領取方式（例：現金＋喜鴻購物金＋咖啡廳兌換券），預覽頁直接以文字顯示（無單選鈕）
- **選項分配**：發送設定可複選，並顯示「發送配置」；預覽頁以單選列出生效中的組合

點擊「確認」→ 驗證通過 → 觸發 `settings:submit` → 顯示預覽頁；預覽頁「上一步」回到設定頁。

送出資料中的 `sendMode` 為 `options` 或 `fixed`；固定選項時 `combinations` 為空陣列，領取內容即 `fixed`／`dynamic` 中 `checked: true` 的項目。

## 常見調整

- **改預設資料**：`js/config.js` 的 `DEFAULTS`
- **改補助對象選項**：`js/config.js` 的 `SUBSIDY_TARGETS`
- **串接後端送出**：`js/main.js` 的 `onSubmit()`（目前會觸發 `settings:submit` 事件）
- **載入既有資料**：`window.settingsForm.render(data)`；讀取目前設定：`window.settingsForm.getValue()`
- **新增發送配置的呈現方式**：在 `js/views/` 新增檔案並註冊 `App.comboViews.<名稱>`，
  需提供 `init(api)`、`reset()`、`render(container, ctx)`、`unconfiguredMessage`，
  再於 HTML 的 `#comboList` 設定 `data-view="<名稱>"`
