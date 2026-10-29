/**
 * 方案配置呈現方式：清單（對應目前 Figma）
 * 每列 = 勾選（啟用）＋組合名稱＋合計金額。
 */
(function (App) {
  'use strict';
  const { el, money, createCheckbox } = App.utils;
  let combos;

  function createItem(combo) {
    const item = el('div', { className: `combo-item${combo.enabled && combo.valid ? '' : ' is-off'}` });
    const check = createCheckbox({ checked: combo.enabled, disabled: !combo.valid, ariaLabel: '啟用組合' });
    const name = el('div', { className: 'combo-name', textContent: combo.names.join('＋') });
    if (!combo.valid) name.appendChild(el('span', { className: 'combo-warn', textContent: '含未勾選的發送方式，暫不生效' }));
    const total = el('div', { className: 'combo-total', textContent: `${money(combo.total)} 元` });

    check.querySelector('.check-input').addEventListener('change', e => combos.setEnabled(combo, e.target.checked));
    item.append(check, name, total);
    return item;
  }

  App.comboViews = App.comboViews || {};
  App.comboViews.list = {
    unconfiguredMessage: '尚未配置，請點擊［配置］產生組合',
    init(api) { combos = api; },
    reset() {},
    render(container, { list, emptyMessage }) {
      container.replaceChildren();
      if (!list.length) container.appendChild(el('div', { className: 'combo-empty', textContent: emptyMessage }));
      list.forEach(c => container.appendChild(createItem(c)));
    },
  };
})(window.SettingsApp = window.SettingsApp || {});
