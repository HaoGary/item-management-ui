/**
 * 預覽頁：點擊「確認」後，呈現員工端看到的「領取方式」選擇（Figma「預覽頁面」）
 *   選項分配：列出生效中的發送組合，員工擇一領取
 *   固定選項：所有勾選項目合成唯一的領取方式，只顯示文字（不需選擇，無單選鈕）
 * 選項分配時第一個選項預設選取；「上一步」回到設定頁，設定內容保留。
 */
(function (App) {
  'use strict';
  const { $, el } = App.utils;

  let page, form, group, backButton;

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
      if (!page || !form || !group || !backButton) return false;
      backButton.addEventListener('click', () => {
        show(false);
        onBack?.();
      });
      return true;
    },

    /** @param {object} data settingsForm.getValue() 的結果 */
    open(data) {
      if (data.sendMode === 'fixed') {
        const label = [...data.fixed, ...data.dynamic].filter(m => m.checked).map(m => m.name).join('＋');
        group.replaceChildren(el('p', { className: 'paper-value', textContent: label }));
        show(true);
        return;
      }

      const labels = data.combinations.map(c => c.names.join('＋'));
      group.replaceChildren(...(labels.length
        ? labels.map((label, i) => createRadio(label, i === 0))
        : [el('p', { className: 'paper-empty', textContent: '尚無可選的領取方式' })]));
      show(true);
    },

    isOpen: () => !page.hidden,
  };
})(window.SettingsApp = window.SettingsApp || {});
