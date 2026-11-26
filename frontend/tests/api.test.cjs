const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(readFileSync(join(__dirname, '../src/services/api.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function client(fetch, timeout = AbortSignal.timeout) {
  const exports = {};
  vm.runInNewContext(source, {
    exports, fetch, Headers, DOMException, SyntaxError, Event,
    AbortSignal: { timeout }, window: { dispatchEvent() {} },
  });
  return exports;
}

test('catalog uses same origin, credentials and a 15-second budget', async () => {
  let budget;
  const api = client(async (url, options) => {
    assert.equal(url, '/api/products');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([]);
  }, milliseconds => { budget = milliseconds; return AbortSignal.timeout(milliseconds); });
  assert.equal((await api.getProducts()).length, 0);
  assert.equal(budget, 15000);
});

test('connection loss is distinguished from an invalid response', async () => {
  const offline = client(async () => { throw new TypeError('fixture offline'); });
  await assert.rejects(offline.getProducts(), error => error.kind === 'connection');
  const malformed = client(async () => new Response('{'));
  await assert.rejects(malformed.getProducts(), error => error.kind === 'response');
  const unexpected = client(async () => Response.json({ products: [] }));
  await assert.rejects(unexpected.getProducts(), error => error.kind === 'response');
});

test('a timeout while reading the body is reported as a timeout', async () => {
  const controller = new AbortController();
  const api = client(async () => ({
    ok: true, status: 200,
    async json() {
      controller.abort(new DOMException('Fixture timeout', 'TimeoutError'));
      throw new DOMException('Fixture aborted', 'AbortError');
    },
  }), () => controller.signal);
  await assert.rejects(api.getProducts(), error => error.kind === 'timeout');
});

test('known sale rejections stay distinct from an unknown outcome', async () => {
  for (const status of [400, 403, 409]) {
    const api = client(async url => url.endsWith('/csrf')
      ? Response.json({ headerName: 'X-CSRF-TOKEN', token: 'fixture' })
      : Response.json({ code: 'stock_conflict', detail: 'Stock insuficiente.' }, { status }));
    await assert.rejects(api.processSale({ paymentType: 'CASH', items: [] }, 'fixture-key'),
      error => error instanceof api.SaleRejectedError);
  }
  const api = client(async url => url.endsWith('/csrf')
    ? Response.json({ headerName: 'X-CSRF-TOKEN', token: 'fixture' })
    : new Response('{', { status: 201 }));
  await assert.rejects(api.processSale({ paymentType: 'CASH', items: [] }, 'fixture-key'),
    error => error instanceof api.ApiTransportError && !(error instanceof api.SaleRejectedError));
});

test('a history response with an invalid structure has an actionable error', async () => {
  const api = client(async () => Response.json([{ id: 1, createdAt: null, items: [] }]));
  await assert.rejects(api.getTodaySales(), error => error.kind === 'response');
});

const reportFixture = () => ({
  periodDays: 30, totalSold: 2, totalRevenue: 90, atRiskPairs: 7, classAPercentage: 100,
  models: [{
    productId: 1, colorId: null, productName: 'Modelo', brandName: null, colorName: null,
    totalSold: 2, revenue: 90, velocityPerDay: 0.1, currentStock: 7,
    classification: 'CLASS_A', stockStatus: 'Rotación saludable', sizeBreakdown: { 40: 7 },
  }],
  liquidationSuggestions: ['Modelo · talla 40: 7 pares sin ventas en 45 días'],
});

test('analytics reads real reports and supports a period without sales', async () => {
  const fixture = reportFixture();
  const api = client(async url => {
    assert.equal(url, '/api/analytics/pareto?days=30');
    return Response.json(fixture);
  });
  assert.deepEqual(JSON.parse(JSON.stringify(await api.getParetoReport(30))), fixture);
  const empty = client(async () => Response.json({
    ...fixture, totalSold: 0, totalRevenue: 0, classAPercentage: 0, models: [],
  }));
  assert.equal((await empty.getParetoReport(30)).models.length, 0);
});

test('analytics rejects invalid metrics before rendering', async () => {
  const invalid = [
    null, {}, { ...reportFixture(), periodDays: 7 }, { ...reportFixture(), totalRevenue: -1 },
    { ...reportFixture(), atRiskPairs: 1.5 }, { ...reportFixture(), classAPercentage: 101 },
    { ...reportFixture(), liquidationSuggestions: [null] },
    ...[
      null, { productId: 0 }, { colorId: undefined }, { currentStock: -2 }, { totalSold: '2' },
      { classification: 'A' }, { stockStatus: 'unknown' }, { sizeBreakdown: [] },
      { sizeBreakdown: { invalid: 2 } }, { sizeBreakdown: { 40: -1 } },
    ].map(fields => ({ ...reportFixture(), models: [fields === null ? null : { ...reportFixture().models[0], ...fields }] })),
  ];
  for (const fixture of invalid) {
    const api = client(async () => Response.json(fixture));
    await assert.rejects(api.getParetoReport(30), error => error.kind === 'response' && error.message.includes('informe'));
  }
});

test('analytics distinguishes expired sessions, forbidden access and network errors', async () => {
  for (const status of [401, 403]) {
    const api = client(async () => new Response(null, { status }));
    await assert.rejects(api.getParetoReport(30), error =>
      error.message.includes(status === 401 ? 'sesión' : 'Acceso denegado'));
  }
  const offline = client(async () => { throw new TypeError('fixture offline'); });
  await assert.rejects(offline.getParetoReport(30), error => error.kind === 'connection');
});
