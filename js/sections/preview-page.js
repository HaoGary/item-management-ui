/**
 * 預覽頁：點擊「確認」後，以員工申請畫面的樣子呈現目前設定（Figma「預覽頁面」）
 *
 * 欄位
 *   申請項目：項目名稱
 *   補助對象：設定中的補助對象
 *   請款金額：所選補助對象的金額（切換補助對象時即時更新）
 *   領取方式：選項分配 → 生效中的發送組合；固定選項 → 唯一的發送方式
 * 「上一步」回到設定頁，設定內容保留。
 */
(function (App) {
  'use strict';
  const { $, el, money } = App.utils;

  let page, form, itemSelect, targetSelect, amountText, methodSelect, backButton;
  let subsidyRows = [];

  const fillSelect = (select, labels, emptyLabel) => {
    select.replaceChildren(...(labels.length
      ? labels.map(text => el('option', { textContent: text }))
      : [el('option', { textContent: emptyLabel, disabled: true, selected: true })]));
  };

  function updateAmount() {
    const row = subsidyRows[targetSelect.selectedIndex];
    amountText.textContent = row ? `NT$ ${money(row.amount)}` : '—';
  }

  function show(visible) {
    page.hidden = !visible;
    form.hidden = visible;
    window.scrollTo({ top: 0 });
  }

  App.previewPage = {
    /** @param {{ onBack?: Function }} [options] 按「上一步」時呼叫 */
    init({ onBack } = {}) {
      page = $('previewPage');
      form = $('settings');
      itemSelect = $('pvItem');
      targetSelect = $('pvTarget');
      amountText = $('pvAmount');
      methodSelect = $('pvMethod');
      backButton = $('pvBack');
      if (!page || !form || !itemSelect || !targetSelect || !amountText || !methodSelect || !backButton) return false;

      targetSelect.addEventListener('change', updateAmount);
      backButton.addEventListener('click', () => {
        show(false);
        onBack?.();
      });
      return true;
    },

    /** @param {object} data settingsForm.getValue() 的結果 */
    open(data) {
      subsidyRows = data.subsidy;
      fillSelect(itemSelect, [data.itemName], '');
      fillSelect(targetSelect, subsidyRows.map(s => s.target), '（尚無補助對象）');

      const methodLabels = data.sendMode === 'fixed'
        ? [...data.fixed, ...data.dynamic].filter(m => m.checked).map(m => m.name)
        : data.combinations.map(c => c.names.join('＋'));
      fillSelect(methodSelect, methodLabels, '（尚無可選的領取方式）');

      updateAmount();
      show(true);
    },

    isOpen: () => !page.hidden,
  };
})(window.SettingsApp = window.SettingsApp || {});
