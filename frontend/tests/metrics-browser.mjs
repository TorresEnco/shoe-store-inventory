// Run after npm run build. Uses Edge and an isolated synthetic API on loopback.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

let scenario = 'normal';
let reads = 0;
const requests = [];
const model = (colorId, colorName, classification, totalSold, revenue) => ({
  productId: 1, colorId, productName: 'Modelo de prueba', brandName: null, colorName,
  totalSold, revenue, velocityPerDay: 0.1, currentStock: 7, classification,
  stockStatus: 'Rotación saludable', sizeBreakdown: { 40: 7 },
});
const report = days => ({
  periodDays: days, totalSold: 3, totalRevenue: 150.25, atRiskPairs: 7, classAPercentage: 90,
  models: [model(1, 'Negro', 'CLASS_A', 2, 135.25), model(2, 'Blanco', 'CLASS_B', 1, 15)],
  liquidationSuggestions: ['Modelo de prueba · Negro · talla 40: 7 pares sin ventas en 45 días'],
});
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/auth/csrf') return res.end(JSON.stringify({ headerName: 'X-CSRF-TOKEN', token: 'fixture' }));
    if (url.pathname === '/api/auth/me') return res.end(JSON.stringify({ id: 1, fullName: 'Admin ficticio', username: 'fixture', role: 'ADMIN' }));
    if (url.pathname === '/api/products') return res.end('[]');
    if (url.pathname === '/api/analytics/pareto') {
      const days = Number(url.searchParams.get('days'));
      requests.push(days);
      const mode = scenario;
      if (mode === 'normal' && ++reads === 1) await delay(350);
      if (mode === 'race' && days === 7) await delay(450);
      if (mode === 'forbidden') { res.statusCode = 403; return res.end('{}'); }
      if (mode === 'invalid') return res.end('{"models":[null]}');
      const data = report(days);
      if (mode === 'empty') Object.assign(data, { totalSold: 0, totalRevenue: 0, classAPercentage: 0, models: [] });
      if (mode === 'race') {
        data.models[0].productName = days === 7 ? 'Informe obsoleto' : 'Informe vigente';
      }
      return res.end(JSON.stringify(data));
    }
    res.statusCode = 404;
    return res.end('{}');
  }
  try {
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(await readFile(join(dist, file)));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const profile = await mkdtemp(join(tmpdir(), 'torres-metrics-edge-'));
const edge = spawn(process.env.METRICS_BROWSER_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let ws;
const deadline = setTimeout(() => { edge.kill(); server.close(); throw new Error('Browser verification timed out'); }, 45000);
deadline.unref();
async function until(read) {
  for (let i = 0; i < 100; i++) {
    if (await read().catch(() => false)) return;
    await delay(50);
  }
  throw new Error('Timed out: ' + read.toString());
}
try {
  let port;
  await until(async () => { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0]; return port; });
  const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  const pending = new Map();
  let id = 0;
  ws.addEventListener('message', ({ data }) => {
    const reply = JSON.parse(data);
    if (!pending.has(reply.id)) return;
    const { resolve, reject } = pending.get(reply.id);
    pending.delete(reply.id);
    reply.error ? reject(reply.error) : resolve(reply.result);
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  const text = () => evaluate('document.body.innerText');
  const click = label => evaluate("[...document.querySelectorAll('button')].find(x=>x.textContent.includes(" + JSON.stringify(label) + ')).click()');
  async function period(days) {
    await evaluate("(()=>{const select=document.querySelector('#metrics-period');select.value='" + days + "';select.dispatchEvent(new Event('change',{bubbles:true}));})()");
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port });
  await until(async () => (await text()).includes('Venta Rápida'));
  await click('Métricas');
  await until(async () => (await text()).includes('Cargando informe'));
  await until(async () => (await text()).includes('S/. 150.25'));
  assert.ok((await text()).includes('Clase A (1)'));
  assert.ok((await text()).includes('Clase B (1)'));
  assert.ok(!(await text()).includes('Crear promo'));
  await click('Clase B');
  assert.ok((await text()).includes('Blanco'));
  await click('Clase C');
  assert.ok((await text()).includes('Sin grupos con ventas'));
  await click('Clase A');
  await evaluate("document.querySelector('#metrics-period').focus()");
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.ok(await evaluate("document.activeElement.matches('button[aria-pressed]')"));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const screenshot = join(tmpdir(), 'torres-metrics-preview.png');
  await writeFile(screenshot, Buffer.from(shot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
  await evaluate("document.documentElement.style.fontSize='200%'");
  if (await evaluate('document.documentElement.scrollWidth > 320')) {
    const overflowShot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(join(tmpdir(), 'torres-metrics-overflow.png'), Buffer.from(overflowShot.data, 'base64'));
    console.log(await evaluate("[...document.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>321).map(el=>({tag:el.tagName,text:el.textContent.slice(0,60),width:el.getBoundingClientRect().width})).slice(-12)"));
  }
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 320'));
  scenario = 'race';
  await period(7);
  await until(async () => requests.includes(7));
  await period(90);
  await until(async () => (await text()).includes('Informe vigente'));
  await delay(550);
  assert.ok(!(await text()).includes('Informe obsoleto'));
  assert.ok((await text()).includes('7 pares sin ventas en 45 días'));
  scenario = 'empty';
  await period(30);
  await until(async () => (await text()).includes('No hay ventas completadas'));
  assert.ok((await text()).includes('7 pares sin ventas en 45 días'));
  scenario = 'forbidden';
  await period(7);
  await until(async () => (await text()).includes('Acceso denegado'));
  scenario = 'invalid';
  await click('Reintentar informe');
  await until(async () => (await text()).includes('formato inválido'));
  scenario = 'normal';
  await click('Reintentar informe');
  await until(async () => (await text()).includes('S/. 150.25'));
  assert.ok(requests.includes(30) && requests.includes(7) && requests.includes(90));
  console.log('PASS: real API contract, loading, classes, empty period, 403, invalid response, retry and stale-read protection.');
  console.log('PASS: keyboard, 320px with 200% text and fixed liquidation window.');
  console.log(screenshot);
} finally {
  clearTimeout(deadline);
  ws?.close();
  edge.kill();
  server.closeAllConnections();
  server.close();
}
