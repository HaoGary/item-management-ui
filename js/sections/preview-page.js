/**
 * 預覽頁：點擊「確認」後，呈現員工端看到的「方案選擇」（Figma「預覽頁面」）
 *   員工自選：顯示開放日期，並以單選列出生效中的方案組合（第一個預設選取）
 *   固定選項：所有勾選項目合成唯一的方案，只顯示文字（不需選擇，無單選鈕）
 * 「上一步」回到設定頁，設定內容保留。
 */
(function (App) {
  'use strict';
  const { $, el } = App.utils;

  let page, form, group, backButton, period, periodValue;

  function createRadio(label, checked) {
    const option = el('label', { className: 'radio' });
    option.innerHTML = `
      <input type="radio" class="radio-input" name="pvMethod"${checked ? ' checked' : ''}>
      <svg class="radio-icon radio-icon--off"><use href="#i-radio-off"/></svg>
      <svg class="radio-icon radio-icon--on"><use href="#i-radio-on"/></svg>`;
    option.querySelector('.radio-input').value = label;
    option.append(label);
    return option;
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
      group = $('pvMethods');
      backButton = $('pvBack');
      period = $('pvPeriod');
      periodValue = $('pvPeriodValue');
      if (!page || !form || !group || !backButton || !period || !periodValue) return false;
      backButton.addEventListener('click', () => {
        show(false);
        onBack?.();
      });
      return true;
    },

    /** @param {object} data settingsForm.getValue() 的結果 */
    open(data) {
      period.hidden = data.sendMode === 'fixed' || !data.openPeriod;
      if (data.openPeriod) periodValue.textContent = App.dateRange.format(data.openPeriod);

      if (data.sendMode === 'fixed') {
        const label = [...data.fixed, ...data.dynamic].filter(m => m.checked).map(m => m.name).join('＋');
        group.replaceChildren(el('p', { className: 'paper-value', textContent: label }));
        show(true);
        return;
      }

      const labels = data.combinations.map(c => c.names.join('＋'));
      group.replaceChildren(...(labels.length
        ? labels.map((label, i) => createRadio(label, i === 0))
        : [el('p', { className: 'paper-empty', textContent: '尚無可選的方案' })]));
      show(true);
    },

    isOpen: () => !page.hidden,
  };
})(window.SettingsApp = window.SettingsApp || {});
