/**
 * 進入點：組合各區塊、表單驗證、確認／取消流程。
 *
 * 流程
 *   確認 → 驗證（含總額核對）→ 送出（settings:submit 事件）→ 顯示預覽頁（員工申請畫面）
 *   預覽頁「上一步」→ 回到設定頁（內容保留）
 *   取消 → 重置為預設資料
 *
 * 對外介面（保留原本名稱）
 *   window.settingsForm.render(data)  載入資料
 *   window.settingsForm.getValue()    取得目前設定
 */
(function (App) {
  'use strict';
  const { $, money, toast, clearFieldErrors } = App.utils;
  const { DEFAULTS } = App.config;

  let form;

  /* ---------- 資料讀寫 ---------- */
  function render(data) {
    App.itemName.render(data.itemName);
    App.subsidy.render(data.subsidy);
    const mode = document.querySelector(`input[name="applyMode"][value="${data.applyMode}"]`);
    if (mode) mode.checked = true;
    App.sendMethods.render(data.fixed, data.dynamic);
    App.sendMode.render(data.sendMode || 'fixed');
    App.combos.load(data.combo);
    App.combos.refresh();
  }

  function getValue() {
    const { fixed, dynamic } = App.sendMethods.getValue();
    return {
      itemName: App.itemName.getValue(),
      subsidy: App.subsidy.getValue(),
      applyMode: document.querySelector('input[name="applyMode"]:checked')?.value,
      sendMode: App.sendMode.getValue(),        // options = 選項分配；fixed = 固定選項
      fixed,
      dynamic,
      combinations: App.sendMode.isFixed() ? [] : App.combos.getActive(),   // 實際生效的組合（固定選項沒有組合）
      combo: App.combos.serialize(),            // 組合設定（可存回後端，下次 render 時還原）
    };
  }

  /* ---------- 驗證 ---------- */
  /** @returns {string} 錯誤訊息；通過回傳空字串 */
  function validate(data) {
    clearFieldErrors();
    if (!data.itemName) {
      App.itemName.markError();
      return '請輸入項目名稱';
    }
    const targets = data.subsidy.map(s => s.target);
    if (new Set(targets).size !== targets.length) return '補助對象不可重複';

    const zeroFields = App.subsidy.getAmountFields().filter(f => App.amountField.read(f) <= 0);
    if (zeroFields.length) {
      zeroFields.forEach(f => f.classList.add('is-error'));
      return '請輸入補助金額';
    }

    const methods = [...data.fixed, ...data.dynamic];
    if (!methods.some(m => m.checked)) return '請至少勾選一種發送方式';
    if (App.sendMethods.hasUnnamedChecked()) return '請填寫自訂欄位名稱';
    const names = methods.filter(m => m.checked).map(m => m.name);
    if (new Set(names).size !== names.length) return '發送方式名稱不可重複';
    if (data.sendMode !== 'fixed' && App.combos.hasInvalidManual()) return '有手動組合含未勾選的發送方式，請調整後再送出';

    // 核對總額：補助對象與金額 vs. 發送方式（僅計算已勾選項目）
    const subsidyTotal = data.subsidy.reduce((sum, s) => sum + s.amount, 0);
    const sendTotal = methods.filter(m => m.checked).reduce((sum, m) => sum + m.amount, 0);
    if (subsidyTotal !== sendTotal) {
      document.querySelectorAll('.subsidy-row .field, .option .field:not(.is-disabled)').forEach(f => f.classList.add('is-error'));
      return `總額不一致：補助對象與金額 ${money(subsidyTotal)} 元，發送方式 ${money(sendTotal)} 元`;
    }
    return '';
  }

  /* ---------- 確認／取消 ---------- */
  function onSubmit(e) {
    e.preventDefault();
    const data = getValue();
    const error = validate(data);
    if (error) return toast(error, 4000);
    // 串接後端：在此送出 data，例如
    // fetch('/api/...', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    document.dispatchEvent(new CustomEvent('settings:submit', { detail: data }));
    App.previewPage.open(data);
  }

  function onCancel() {
    clearFieldErrors();
    render(structuredClone(DEFAULTS));
    window.scrollTo({ top: 0 });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    form = $('settings');
    const list = $('comboList');
    const view = App.comboViews?.[list?.dataset.view || 'list'];

    const ready = form
      && App.itemName.init()
      && App.subsidy.init()
      && App.sendMethods.init({ onChange: () => App.combos.refresh() })
      && App.sendMode.init({ onChange: () => App.combos.refresh() })
      && App.combos.init({ view })
      && App.previewPage.init();
    if (!ready) {
      console.error('[settings] 頁面結構不完整，無法初始化。請確認 HTML 的 id 與 data-view 設定。');
      return;
    }

    form.addEventListener('submit', onSubmit);
    $('cancelBtn')?.addEventListener('click', onCancel);

    window.settingsForm = { render, getValue };
    render(structuredClone(DEFAULTS));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window.SettingsApp = window.SettingsApp || {});
