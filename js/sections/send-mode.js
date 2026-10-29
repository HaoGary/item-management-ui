/**
 * 區塊：發送方式（固定選項／員工自選）
 * 決定「發送方案」與「方案配置」的可用方式：
 *   fixed（固定選項）  ：發送方案可複選，不顯示「方案配置」，所有勾選項目合成唯一的方案
 *   options（員工自選）：發送方案可複選，顯示「方案配置」與「開放方案選擇日期」，員工於期間內自選方案
 */
(function (App) {
  'use strict';
  const { $ } = App.utils;

  const NAME = 'sendMode';
  let comboRow, periodBox, controls;
  let notifyChange = () => {};

  const getValue = () => document.querySelector(`input[name="${NAME}"]:checked`)?.value || 'fixed';

  /** 依目前模式顯示／隱藏：方案配置、開放日期 */
  function apply() {
    const fixed = getValue() === 'fixed';
    comboRow.hidden = fixed;
    periodBox.hidden = fixed;
    controls.closest('.mode-col').classList.toggle('mode-col--expanded', !fixed);
  }

  App.sendMode = {
    /** @param {{ onChange: Function }} options 模式切換後呼叫 */
    init({ onChange }) {
      comboRow = $('comboRow');
      periodBox = $('openPeriod');
      controls = document.querySelector('.mode-controls');
      const radios = document.querySelectorAll(`input[name="${NAME}"]`);
      if (!comboRow || !periodBox || !controls || !radios.length) return false;
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
