/**
 * 區塊：項目名稱
 * 必填文字欄位，最多 10 個字，右側顯示目前字數（例：3/10）。
 */
(function (App) {
  'use strict';
  const { $ } = App.utils;

  let input, counter;

  function updateCounter() {
    counter.textContent = `${input.value.length}/${input.maxLength}`;
  }

  App.itemName = {
    init() {
      input = $('itemName');
      counter = $('itemNameCount');
      if (!input || !counter) return false;
      input.addEventListener('input', () => {
        input.closest('.field').classList.remove('is-error');
        updateCounter();
      });
      return true;
    },
    render(value) {
      input.value = value || '';
      updateCounter();
    },
    getValue: () => input.value.trim(),
    /** 標示錯誤（驗證未通過時） */
    markError: () => input.closest('.field').classList.add('is-error'),
  };
})(window.SettingsApp = window.SettingsApp || {});
