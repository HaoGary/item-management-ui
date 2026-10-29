/**
 * 日期區間欄位（設計系統 DatePickerComBox）
 * 欄位顯示「2025/11/01 - 2025/11/30」，點擊後展開面板選擇開始／結束日期，按「確定」套用。
 * 點擊外部或按 Esc 會關閉面板並放棄尚未套用的修改。
 */
(function (App) {
  'use strict';
  const { $, toast } = App.utils;

  let root, field, valueText, panel, startInput, endInput, applyButton, clearButton;
  let value = null;            // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } 或 null
  let notifyChange = () => {};

  const PLACEHOLDER = '請選擇日期';

  /** 'YYYY-MM-DD' → 'YYYY/MM/DD' */
  const display = iso => iso.replaceAll('-', '/');
  const formatRange = range => (range ? `${display(range.start)} - ${display(range.end)}` : '');

  function renderValue() {
    valueText.textContent = value ? formatRange(value) : PLACEHOLDER;
    valueText.classList.toggle('is-placeholder', !value);
  }

  function setOpen(open) {
    panel.hidden = !open;
    field.setAttribute('aria-expanded', open);
    field.classList.toggle('is-open', open);
    if (open) {
      startInput.value = value?.start || '';
      endInput.value = value?.end || '';
      startInput.focus();
    }
  }

  function apply() {
    const start = startInput.value;
    const end = endInput.value;
    if (!start || !end) return toast('請選擇開始與結束日期');
    if (end < start) return toast('結束日期不可早於開始日期');
    value = { start, end };
    renderValue();
    field.classList.remove('is-error');
    setOpen(false);
    notifyChange();
  }

  App.dateRange = {
    /**
     * @param {string} rootId 外層元素 id
     * @param {{ onChange?: Function }} [options]
     */
    init(rootId, { onChange } = {}) {
      root = $(rootId);
      if (!root) return false;
      field = root.querySelector('.date-range-field');
      valueText = root.querySelector('.date-range-value');
      panel = root.querySelector('.date-range-panel');
      startInput = root.querySelector('[data-role="start"]');
      endInput = root.querySelector('[data-role="end"]');
      applyButton = root.querySelector('[data-role="apply"]');
      clearButton = root.querySelector('[data-role="clear"]');
      if (!field || !valueText || !panel || !startInput || !endInput || !applyButton || !clearButton) return false;
      if (onChange) notifyChange = onChange;

      field.addEventListener('click', () => setOpen(panel.hidden));
      applyButton.addEventListener('click', apply);
      clearButton.addEventListener('click', () => {
        value = null;
        renderValue();
        setOpen(false);
        notifyChange();
      });
      document.addEventListener('click', e => { if (!panel.hidden && !root.contains(e.target)) setOpen(false); });
      root.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !panel.hidden) { setOpen(false); field.focus(); }
      });
      return true;
    },
    /** @param {{ start: string, end: string } | null} range */
    render(range) {
      value = range ? { ...range } : null;
      renderValue();
      setOpen(false);
      field.classList.remove('is-error');
    },
    getValue: () => (value ? { ...value } : null),
    format: formatRange,
    markError: () => field.classList.add('is-error'),
  };
})(window.SettingsApp = window.SettingsApp || {});
