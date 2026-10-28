/**
 * 金額輸入框（設計系統 TextField - 請款金額）
 * 只允許輸入數字；可選擇是否顯示千分位；清空後離開欄位會補 0。
 */
(function (App) {
  'use strict';
  const { el, parseAmount, clearFieldErrors } = App.utils;

  /**
   * @param {number} value 初始金額
   * @param {{ withComma?: boolean }} [options]
   * @returns {HTMLDivElement} .field 元素
   */
  function createAmountField(value, { withComma = false } = {}) {
    const field = el('div', { className: 'field' });
    field.innerHTML = '<input type="text" class="field-input" inputmode="numeric" aria-label="金額"><span class="field-suffix">元</span>';
    const input = field.querySelector('.field-input');
    const format = n => (withComma ? Number(n).toLocaleString('en-US') : String(Number(n)));

    input.value = format(value);
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
      input.value = digits === '' ? '' : format(digits);
      clearFieldErrors();
    });
    input.addEventListener('blur', () => {
      if (input.value !== '') return;
      input.value = '0';
      input.dispatchEvent(new Event('input', { bubbles: true }));   // 通知外層重新計算
    });
    return field;
  }

  /** 讀取 .field 內的金額數值 */
  const readAmount = field => parseAmount(field.querySelector('.field-input').value);

  App.amountField = { create: createAmountField, read: readAmount };
})(window.SettingsApp = window.SettingsApp || {});
