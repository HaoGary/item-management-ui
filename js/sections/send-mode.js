/**
 * 區塊：發送方式（選項分配／固定選項）
 * 決定「發送設定」與「發送配置」的可用方式：
 *   options（選項分配）：發送設定可複選，並顯示「發送配置」產生組合
 *   fixed（固定選項）  ：發送設定只能選一項，不顯示「發送配置」
 */
(function (App) {
  'use strict';
  const { $ } = App.utils;

  const NAME = 'sendMode';
  let comboRow;
  let notifyChange = () => {};

  const getValue = () => document.querySelector(`input[name="${NAME}"]:checked`)?.value || 'options';

  /** 依目前模式套用：單選限制、顯示／隱藏發送配置 */
  function apply() {
    const fixed = getValue() === 'fixed';
    App.sendMethods.setSingleSelect(fixed);
    comboRow.hidden = fixed;
  }

  App.sendMode = {
    /** @param {{ onChange: Function }} options 模式切換後呼叫 */
    init({ onChange }) {
      comboRow = $('comboRow');
      const radios = document.querySelectorAll(`input[name="${NAME}"]`);
      if (!comboRow || !radios.length) return false;
      notifyChange = onChange;
      radios.forEach(r => r.addEventListener('change', () => {
        apply();
        notifyChange();
      }));
      return true;
    },
    render(mode) {
      const radio = document.querySelector(`input[name="${NAME}"][value="${mode}"]`);
      if (radio) radio.checked = true;
      apply();
    },
    getValue,
    isFixed: () => getValue() === 'fixed',
  };
})(window.SettingsApp = window.SettingsApp || {});
