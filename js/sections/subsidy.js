/**
 * 區塊：補助對象與金額
 * 每列 = 刪除鈕 + 補助對象下拉 + 金額（千分位）。至少保留 1 列，最多 MAX_ROWS 列。
 */
(function (App) {
  'use strict';
  const { $, el, icon, iconButton } = App.utils;
  const { MAX_ROWS, SUBSIDY_TARGETS } = App.config;

  let list, addButton, counter;

  function createRow({ target, amount }) {
    const row = el('div', { className: 'subsidy-row' });
    const remove = iconButton('刪除', 'i-minus');
    remove.addEventListener('click', () => {
      row.remove();
      updateControls();
    });

    const select = el('div', { className: 'select' });
    select.innerHTML = `
      <select class="select-control" aria-label="補助對象">${SUBSIDY_TARGETS.map(t => `<option${t === target ? ' selected' : ''}>${t}</option>`).join('')}</select>
      ${icon('i-dropdown', 19.2, 'select-arrow')}`;

    row.append(remove, select, App.amountField.create(amount, { withComma: true }));
    return row;
  }

  /** 更新數量顯示、新增鈕上限、最後一列不可刪除 */
  function updateControls() {
    const count = list.children.length;
    counter.textContent = `${count}/${MAX_ROWS}`;
    addButton.disabled = count >= MAX_ROWS;
    list.querySelectorAll('.icon-btn').forEach(b => { b.disabled = count <= 1; });
  }

  function addRow() {
    if (list.children.length >= MAX_ROWS) return;
    const used = [...list.querySelectorAll('.select-control')].map(s => s.value);
    const next = SUBSIDY_TARGETS.find(t => !used.includes(t)) || SUBSIDY_TARGETS[0];
    list.appendChild(createRow({ target: next, amount: 0 }));
    updateControls();
  }

  App.subsidy = {
    init() {
      list = $('subList');
      addButton = $('subAdd');
      counter = $('subCount');
      if (!list || !addButton || !counter) return false;
      addButton.addEventListener('click', addRow);
      return true;
    },
    render(rows) {
      list.replaceChildren(...rows.map(createRow));
      updateControls();
    },
    getValue() {
      return [...list.children].map(row => ({
        target: row.querySelector('.select-control').value,
        amount: App.amountField.read(row.querySelector('.field')),
      }));
    },
    /** 所有金額欄位（驗證用） */
    getAmountFields: () => [...list.querySelectorAll('.field')],
  };
})(window.SettingsApp = window.SettingsApp || {});
