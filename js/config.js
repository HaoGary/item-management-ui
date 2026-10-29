/**
 * 設定常數與頁面預設資料。
 * 「取消」會把頁面還原成 DEFAULTS；串接後端時可改為讀取伺服器資料再呼叫 settingsForm.render(data)。
 */
(function (App) {
  'use strict';

  /** 補助對象、自訂發送方式的欄位上限 */
  const MAX_ROWS = 5;

  /** 補助對象選項（設計稿示意「職工本人」「子女」；「全體員工」為需求新增；「配偶」「父母」為暫定） */
  const SUBSIDY_TARGETS = ['全體員工', '職工本人', '配偶', '子女', '父母'];

  const DEFAULTS = {
    itemName: '生日禮金',                 // 項目名稱（必填，最多 10 字）
    subsidy: [
      { target: '職工本人', amount: 6000 },
      { target: '子女', amount: 3000 },
    ],
    applyMode: 'auto',                    // self = 自行申請；auto = 公司統一發放
    sendMode: 'fixed',                    // fixed = 固定選項（預設，勾選項目合成唯一領取方式）；options = 選項分配
    fixed: [
      { id: 'cash', name: '現金', checked: true, amount: 3000 },
      { id: 'voucher', name: '喜鴻購物金', checked: true, amount: 3000 },
      { id: 'cafe', name: '咖啡廳兌換券', checked: true, amount: 3000 },
    ],
    dynamic: [{ id: 'other-1', name: '其他1', checked: true, amount: 0 }],
    /**
     * 發送配置
     * configured：是否已點擊［配置］自動產生
     * size：每組項目數（數字或 'all'）
     * disabled：被取消勾選的自動組合（key）
     * removed、manual：保留給手動調整組合使用（目前畫面未提供新增／編輯，固定為空陣列）
     */
    combo: { configured: false, size: 2, disabled: [], removed: [], manual: [] },
  };

  App.config = { MAX_ROWS, SUBSIDY_TARGETS, DEFAULTS };
})(window.SettingsApp = window.SettingsApp || {});
