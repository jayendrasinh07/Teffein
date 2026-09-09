const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/authService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');

function serviceFor(auth, href) {
  const location = { href };
  const history = { replaced: null, replaceState(_state, _title, path) { this.replaced = path; } };
  const result = vm.runInNewContext(
    stripTypeScriptTypes(source) + '\n;({ authService })',
    {
      URL,
      URLSearchParams,
      Error,
      console,
      window: { location, history },
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => ({ auth }),
    },
  );
  return { ...result, history };
}

(async () => {
  const active = serviceFor({ getSession: async () => ({ data: { session: { user: { id: 'u' } } }, error: null }) }, 'https://thalimitra.com/reset-password#access_token=secret');
  assert.equal((await active.authService.preparePasswordRecovery()).ready, true);
  assert.equal(active.history.replaced, '/reset-password');

  const code = serviceFor({
    getSession: async () => ({ data: { session: null }, error: null }),
    exchangeCodeForSession: async value => ({ data: { session: value === 'valid-code' ? { user: { id: 'u' } } : null }, error: null }),
  }, 'https://thalimitra.com/reset-password?code=valid-code');
  assert.equal((await code.authService.preparePasswordRecovery()).ready, true);

  const hash = serviceFor({
    getSession: async () => ({ data: { session: null }, error: null }),
    setSession: async tokens => ({ data: { session: tokens.access_token === 'access' ? { user: { id: 'u' } } : null }, error: null }),
  }, 'https://thalimitra.com/reset-password#access_token=access&refresh_token=refresh&type=recovery');
  assert.equal((await hash.authService.preparePasswordRecovery()).ready, true);

  const missing = serviceFor({ getSession: async () => ({ data: { session: null }, error: null }) }, 'https://thalimitra.com/reset-password');
  const result = await missing.authService.preparePasswordRecovery();
  assert.equal(result.ready, false);
  assert.match(result.error.message, /invalid, expired, or already used/);

  console.log('PASS: recovery session validation, code exchange, token restore, and missing-session rejection');
})().catch(error => { console.error(error); process.exitCode = 1; });
