/**
 * 共用工具：DOM 取得、數字格式、ID 產生、組合運算、共用 UI 元件建立、提示訊息。
 * 所有模組掛在 window.SettingsApp 命名空間下（不使用 ES module，確保直接以 file:// 開啟也能執行）。
 */
(function (App) {
  'use strict';

  /** 依 id 取得元素（找不到時回傳 null） */
  const $ = id => document.getElementById(id);

  /** 千分位格式：6000 → "6,000" */
  const money = n => n.toLocaleString('en-US');

  /** 解析金額字串（移除非數字）："6,000" → 6000 */
  const parseAmount = text => Number(String(text).replace(/\D/g, '') || 0);

  /** 產生不重複的 id，例如 other-lx3k20 */
  let seq = 0;
  const createId = prefix => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;

  /** 組合的唯一鍵：與順序無關，["b","a"] 與 ["a","b"] 都是 "a|b" */
  const keyOf = ids => [...ids].sort().join('|');

  /** 從 arr 取 k 個元素的所有組合 */
  function kCombinations(arr, k, start = 0, pick = [], out = []) {
    if (pick.length === k) {
      out.push(pick.slice());
      return out;
    }
    for (let i = start; i <= arr.length - (k - pick.length); i++) {
      pick.push(arr[i]);
      kCombinations(arr, k, i + 1, pick, out);
      pick.pop();
    }
    return out;
  }

  /** 建立元素：el('div', { className: 'x', textContent: 'y' }) */
  function el(tag, props = {}) {
    return Object.assign(document.createElement(tag), props);
  }

  /** SVG 圖示標記（引用 js/icons.js 的 sprite） */
  const icon = (id, size = 19.2, className = '') =>
    `<svg${className ? ` class="${className}"` : ''} width="${size}" height="${size}"><use href="#${id}"/></svg>`;

  /** 圖示按鈕（刪除、編輯…） */
  function iconButton(label, iconId, size = 19.2) {
    const button = el('button', { type: 'button', className: 'icon-btn', innerHTML: icon(iconId, size) });
    button.setAttribute('aria-label', label);
    return button;
  }

  /**
   * 勾選框（設計系統 checkbox/Checkbox）
   * @param {object} opts
   * @param {boolean} opts.checked
   * @param {boolean} [opts.disabled]
   * @param {string}  [opts.ariaLabel]
   * @param {string}  [opts.text]  勾選框右側文字
   * @returns {HTMLLabelElement}
   */
  function createCheckbox({ checked, disabled = false, ariaLabel = '', text = '' }) {
    const label = el('label', { className: 'check' });
    label.innerHTML = `
      <input type="checkbox" class="check-input"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}>
      <span class="check-box check-box--off"></span><svg class="check-box check-box--on"><use href="#i-cb-on"/></svg>`;
    if (text) label.append(text);
    return label;
  }

  /** 提示訊息（頁面上方淡入淡出） */
  let toastTimer = null;
  function toast(message, duration = 2200) {
    const box = $('toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('is-visible'), duration);
  }

  /** 清除所有金額欄位的錯誤標示 */
  const clearFieldErrors = () =>
    document.querySelectorAll('.field.is-error').forEach(f => f.classList.remove('is-error'));

  App.utils = { $, money, parseAmount, createId, keyOf, kCombinations, el, icon, iconButton, createCheckbox, toast, clearFieldErrors };
})(window.SettingsApp = window.SettingsApp || {});
