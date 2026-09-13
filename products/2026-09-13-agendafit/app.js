(function (root) {
  'use strict';
  const STORAGE_KEY = 'agendafit-v1';
  function number(value, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback; }
  function calculate(total, buffer, items) {
    const totalMinutes = number(total, 0), bufferMinutes = Math.min(number(buffer, 0), totalMinutes);
    const cleanItems = (items || []).map((item, index) => ({ title: String(item.title || '').trim() || `항목 ${index + 1}`, minutes: number(item.minutes, 0) }));
    const available = totalMinutes - bufferMinutes;
    const used = cleanItems.reduce((sum, item) => sum + item.minutes, 0);
    const balance = available - used;
    const suggested = balance < 0 && used > 0 ? cleanItems.map(item => ({ ...item, suggestedMinutes: Math.max(0, Math.floor(item.minutes * available / used)) })) : [];
    return { total: totalMinutes, buffer: bufferMinutes, available, used, balance, over: balance < 0, suggested };
  }
  function formatMinutes(value) { return `${value}분`; }
  const api = { calculate, formatMinutes };
  root.AgendaFit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!root.document) return;
  const $ = (selector) => document.querySelector(selector);
  const itemsEl = $('#items'), template = $('#item-template');
  function rows() { return [...itemsEl.querySelectorAll('.agenda-row')].map(row => ({ title: row.querySelector('.topic').value, minutes: row.querySelector('.minutes').value })); }
  function addItem(item = {}) { const node = template.content.cloneNode(true); node.querySelector('.topic').value = item.title || ''; node.querySelector('.minutes').value = item.minutes ?? 5; itemsEl.append(node); update(); }
  function update() {
    const result = calculate($('#total-minutes').value, $('#buffer-minutes').value, rows());
    $('#available').textContent = formatMinutes(result.available); $('#used').textContent = formatMinutes(result.used);
    $('#balance-label').textContent = result.over ? '초과 시간' : '남은 시간'; $('#balance').textContent = formatMinutes(Math.abs(result.balance));
    $('#balance-card').classList.toggle('over', result.over);
    const rec = $('#recommendation');
    if (!rows().length) rec.innerHTML = '<h2>진행 제안</h2><p>아젠다 항목을 추가하면 시간 예산을 확인할 수 있습니다.</p>';
    else if (result.over) { const list = result.suggested.map(item => `<li><strong>${escapeHtml(item.title)}</strong>: ${item.minutes}분 → 약 ${item.suggestedMinutes}분</li>`).join(''); rec.innerHTML = `<h2>진행 제안</h2><p>현재 아젠다는 <strong>${formatMinutes(-result.balance)}</strong> 초과입니다. 비례 축소안입니다.</p><ul>${list}</ul>`; }
    else rec.innerHTML = `<h2>진행 제안</h2><p>시간 예산 안에 들어옵니다. 남은 ${formatMinutes(result.balance)}은 질문·결정·예상치 못한 논의에 남겨두세요.</p>`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: $('#meeting-title').value, total: $('#total-minutes').value, buffer: $('#buffer-minutes').value, items: rows() }));
    $('#save-status').textContent = '이 브라우저에 자동 저장됨';
  }
  function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
  function load(data) { $('#meeting-title').value = data.title || ''; $('#total-minutes').value = data.total ?? 30; $('#buffer-minutes').value = data.buffer ?? 5; itemsEl.innerHTML = ''; (data.items || []).forEach(addItem); update(); }
  document.addEventListener('input', event => { if (event.target.matches('input')) update(); });
  itemsEl.addEventListener('click', event => { if (event.target.matches('.remove')) { event.target.closest('.agenda-row').remove(); update(); } });
  $('#add-item').addEventListener('click', () => addItem()); $('#load-example').addEventListener('click', () => load({ title: '주간 제품 싱크', total: 30, buffer: 5, items: [{title:'지난주 지표',minutes:8},{title:'출시 결정',minutes:12},{title:'막힘 공유',minutes:10}] })); $('#print').addEventListener('click', () => window.print());
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved) load(saved); else { addItem({title:'핵심 결정', minutes:10}); addItem({title:'논의', minutes:10}); } } catch (_) { addItem({title:'핵심 결정', minutes:10}); }
})(typeof window !== 'undefined' ? window : globalThis);
