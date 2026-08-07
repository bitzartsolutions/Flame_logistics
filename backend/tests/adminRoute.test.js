const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/server');

test('GET /admin serves the admin dashboard page', async () => {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/admin`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Admin Dashboard|Admin Login/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
