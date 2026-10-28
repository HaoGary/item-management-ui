/**
 * 區塊：發送配置（組合計算與共用控制）
 *
 * 規則
 * 1. 組合一律依「目前已勾選的發送方式」動態產生，不寫死。
 * 2. 點擊［配置］才產生；每組項目數固定（1 項～N 項，或「全部」）。
 * 3. 發送方式新增、刪除、改名、勾選變更時即時重新計算。
 * 4. 變更每組項目數 → 清除已產生的組合，需重新點擊［配置］。
 *
 * 畫面呈現交給「view」（js/views/combo-list.js），
 * 本模組只負責狀態、計算、項目數選單、［配置］按鈕與提示文字。
 */
(function (App) {
  'use strict';
  const { $, keyOf, kCombinations, toast } = App.utils;

  const state = {
    configured: false,
    size: 2,
    disabled: new Set(),   // 被取消勾選的自動組合 key
    removed: new Set(),    // 被移除的自動組合 key（保留欄位，目前未使用）
    manual: [],            // 手動組合 [{ id, methods: [ids], enabled }]（保留欄位，目前未使用）
  };

  let view = null;
  let container, sizeSelect, configButton, hint;

  /** 依目前欄位計算組合 */
  function compute() {
    const methods = App.sendMethods.getMethods();
    const byId = new Map(methods.map(m => [m.id, m]));
    const order = new Map(methods.map((m, i) => [m.id, i]));
    const active = methods.filter(m => m.checked);
    const n = active.length;

    // 欄位被刪除 → 移除引用它的手動組合與關閉紀錄，維持資料一致
    const before = state.manual.length;
    state.manual = state.manual.filter(c => c.methods.every(id => byId.has(id)));
    const dropped = before - state.manual.length;
    [state.disabled, state.removed].forEach(set =>
      set.forEach(k => { if (k.split('|').some(id => !byId.has(id))) set.delete(k); }));

    // 尚未點擊［配置］→ 不自動產生；每組項目數固定，不足時不產生
    const sizes = !state.configured || n < 1 ? []
      : state.size === 'all' ? Array.from({ length: n }, (_, i) => i + 1)
      : (state.size <= n ? [state.size] : []);

    const describe = (ids, extra) => {
      const sorted = [...ids].sort((a, b) => order.get(a) - order.get(b));
      const items = sorted.map(id => byId.get(id));
      return {
        key: keyOf(ids),
        methods: sorted,
        names: items.map(m => m.name),
        total: items.reduce((sum, m) => sum + m.amount, 0),
        ...extra,
      };
    };

    const manual = state.manual.map(c => describe(c.methods, {
      source: 'manual', id: c.id, enabled: c.enabled, valid: c.methods.every(id => byId.get(id).checked),
    }));
    const manualKeys = new Set(manual.map(c => c.key));
    const auto = [];
    sizes.forEach(k => kCombinations(active, k).forEach(set => {
      const ids = set.map(m => m.id);
      const key = keyOf(ids);
      if (!manualKeys.has(key) && !state.removed.has(key)) {
        auto.push(describe(ids, { source: 'auto', enabled: !state.disabled.has(key), valid: true }));
      }
    }));
    return { methods, active, n, list: [...auto, ...manual], dropped };
  }

  /** 重新計算並更新整個區塊 */
  function refresh() {
    if (!view) return;
    const result = compute();
    const { n, list, dropped } = result;

    // 每組項目數選單：依目前可用欄位數動態產生
    const maxK = Math.max(n, 1, state.size === 'all' ? 1 : state.size);
    sizeSelect.innerHTML = Array.from({ length: maxK }, (_, i) => `<option value="${i + 1}">${i + 1} 項</option>`).join('')
      + '<option value="all">全部</option>';
    sizeSelect.value = String(state.size);

    const enough = n >= 1 && (state.size === 'all' || state.size <= n);
    configButton.disabled = !enough;
    hint.textContent = `目前可用發送方式 ${n} 種，共 ${list.length} 組`;

    const emptyMessage = n < 1 ? '需至少勾選 1 種發送方式才能產生組合'
      : !enough ? `目前僅有 ${n} 種可用發送方式，不足每組 ${state.size} 項`
      : !state.configured ? view.unconfiguredMessage
      : '尚無組合';

    view.render(container, { ...result, enough, emptyMessage });
    if (dropped) toast(`已移除 ${dropped} 個引用已刪除欄位的手動組合`);
  }

  function onSizeChange(e) {
    state.size = e.target.value === 'all' ? 'all' : Number(e.target.value);
    const hadCombos = state.configured || state.manual.length;
    state.configured = false;
    state.disabled.clear();
    state.removed.clear();
    view.reset();
    if (state.size !== 'all') state.manual = state.manual.filter(m => m.methods.length === state.size);
    refresh();
    if (hadCombos) toast('已變更每組項目數，請點擊［配置］重新產生組合');
  }

  function onConfigure() {
    state.configured = true;
    refresh();
    toast(`已產生 ${compute().list.length} 組組合`);
  }

  App.combos = {
    /** @param {{ view: object }} options 呈現方式（App.comboViews.list） */
    init({ view: selectedView }) {
      container = $('comboList');
      sizeSelect = $('comboSize');
      configButton = $('comboConfigBtn');
      hint = $('comboHint');
      if (!container || !sizeSelect || !configButton || !hint || !selectedView) return false;
      view = selectedView;
      view.init?.(App.combos);
      sizeSelect.addEventListener('change', onSizeChange);
      configButton.addEventListener('click', onConfigure);
      return true;
    },
    compute,
    refresh,
    get state() { return state; },
    get size() { return state.size; },

    /** 載入設定（取消／初始化時使用） */
    load(data) {
      state.configured = !!data.configured;
      state.size = data.size;
      state.disabled = new Set(data.disabled);
      state.removed = new Set(data.removed || []);
      state.manual = data.manual.map(m => ({ ...m, methods: [...m.methods] }));
      view.reset();
    },
    /** 匯出設定（可存回後端） */
    serialize() {
      return {
        configured: state.configured,
        size: state.size,
        disabled: [...state.disabled],
        removed: [...state.removed],
        manual: state.manual.map(m => ({ ...m, methods: [...m.methods] })),
      };
    },
    /** 勾選／取消勾選某組合 */
    setEnabled(combo, enabled) {
      if (combo.source === 'auto') enabled ? state.disabled.delete(combo.key) : state.disabled.add(combo.key);
      else state.manual.find(m => m.id === combo.id).enabled = enabled;
      refresh();
    },
    /** 實際生效的組合（送出用） */
    getActive: () => compute().list
      .filter(c => c.enabled && c.valid)
      .map(({ key, source, methods, names, total }) => ({ key, source, methods, names, total })),
    /** 是否有啟用中但含未勾選發送方式的手動組合 */
    hasInvalidManual: () => compute().list.some(c => c.source === 'manual' && c.enabled && !c.valid),
  };
})(window.SettingsApp = window.SettingsApp || {});
