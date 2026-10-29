/**
 * 區塊：發送方案
 * - 固定項目（現金、喜鴻購物金、咖啡廳兌換券）：只能勾選與改金額
 * - 自訂項目（其他N）：可改名、刪除、新增（最多 MAX_ROWS 個）
 * 每個項目有固定 id，方案配置以 id 記錄組合，改名不影響既有組合。
 *
 * 刪除鈕位置由 HTML 的 data-delete-position 決定：start = 左側（目前 Figma）；未設定則放右側

 */
(function (App) {
  'use strict';
  const { $, el, createId, iconButton, createCheckbox } = App.utils;
  const { MAX_ROWS } = App.config;

  let section, fixedGroup, dynamicGroup, addButton, counter;
  let notifyChange = () => {};

  const allRows = () => [...fixedGroup.children, ...dynamicGroup.children];

  /** 未勾選的項目，金額欄位停用 */
  function syncRow(row) {
    const checked = row.querySelector('.check-input').checked;
    const field = row.querySelector('.field');
    field.querySelector('.field-input').disabled = !checked;
    field.classList.toggle('is-disabled', !checked);
  }

  function createOption({ id, name, checked, amount }, editable) {
    const row = el('div', { className: 'option' });
    row.dataset.id = id;

    const check = createCheckbox({ checked });
    row.appendChild(check);

    if (editable) {
      // 勾選框＋名稱為一組（間距 8px），與金額欄位間距 10px
      const title = el('div', { className: 'option-title' });
      const input = el('input', { className: 'option-name-input', maxLength: 10, value: name });
      input.setAttribute('aria-label', '項目名稱');
      title.append(check, input);
      row.appendChild(title);
    } else {
      check.appendChild(el('span', { className: 'option-name', textContent: name }));
    }

    const field = App.amountField.create(amount, { withComma: true });   // 千分位，例：1,000
    row.appendChild(field);

    if (editable) {
      const remove = iconButton('刪除', 'i-minus');
      remove.addEventListener('click', () => {
        row.remove();
        updateControls();
        notifyChange();
      });
      if (dynamicGroup.dataset.deletePosition === 'start') row.prepend(remove);
      else row.appendChild(remove);
    }

    const checkbox = check.querySelector('.check-input');
    checkbox.addEventListener('change', () => syncRow(row));
    syncRow(row);
    return row;
  }

  function updateControls() {
    const count = dynamicGroup.children.length;
    counter.textContent = `${count}/${MAX_ROWS}`;
    addButton.disabled = count >= MAX_ROWS;
  }

  function addCustomOption() {
    if (dynamicGroup.children.length >= MAX_ROWS) return;
    const used = new Set([...dynamicGroup.querySelectorAll('.option-name-input')].map(i => i.value));
    let n = 1;
    while (used.has(`其他${n}`)) n++;
    const row = createOption({ id: createId('other'), name: `其他${n}`, checked: true, amount: 0 }, true);
    dynamicGroup.appendChild(row);
    updateControls();
    notifyChange();
    row.querySelector('.option-name-input').focus();
  }

  /** 目前實際的發送方式（依畫面順序） */
  function getMethods() {
    return allRows().map(row => ({
      id: row.dataset.id,
      name: (row.querySelector('.option-name')?.textContent ?? row.querySelector('.option-name-input').value.trim()) || '（未命名）',
      checked: row.querySelector('.check-input').checked,
      amount: App.amountField.read(row.querySelector('.field')),
    }));
  }

  App.sendMethods = {
    /** @param {{ onChange: Function }} options 任何勾選、改名、改金額、新增、刪除時呼叫 */
    init({ onChange }) {
      section = $('sendRow');
      fixedGroup = $('fixedGroup');
      dynamicGroup = $('dynamicGroup');
      addButton = $('dynAdd');
      counter = $('dynCount');
      if (!section || !fixedGroup || !dynamicGroup || !addButton || !counter) return false;
      notifyChange = onChange;
      addButton.addEventListener('click', addCustomOption);
      section.addEventListener('input', () => notifyChange());
      section.addEventListener('change', () => notifyChange());
      return true;
    },
    render(fixed, dynamic) {
      fixedGroup.replaceChildren(...fixed.map(o => createOption(o, false)));
      dynamicGroup.replaceChildren(...dynamic.map(o => createOption(o, true)));
      updateControls();
    },
    getMethods,
    /** 拆成固定／自訂兩組（送出資料用） */
    getValue() {
      const fixedIds = new Set([...fixedGroup.children].map(r => r.dataset.id));
      const pick = ({ id, name, checked, amount }) => ({ id, name, checked, amount });
      const methods = getMethods();
      return {
        fixed: methods.filter(m => fixedIds.has(m.id)).map(pick),
        dynamic: methods.filter(m => !fixedIds.has(m.id)).map(pick),
      };
    },
    /** 是否有已勾選但未命名的自訂項目 */
    hasUnnamedChecked: () =>
      [...dynamicGroup.querySelectorAll('.option')].some(r =>
        r.querySelector('.check-input').checked && !r.querySelector('.option-name-input').value.trim()),
  };
})(window.SettingsApp = window.SettingsApp || {});
