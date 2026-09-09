const challenge = () =>
  new Response('Thalimitra Operations access required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Thalimitra Operations", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });

const digest = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const constantTimeEqual = (left, right) => {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
};

export default {
  async fetch(request, env) {
    const expectedUser = env.OPS_GATE_USER;
    const expectedPasswordHash = env.OPS_GATE_PASSWORD_SHA256;

    if (!expectedUser || !expectedPasswordHash || !env.ASSETS) {
      return new Response('Operations gateway is not configured.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const authorization = request.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Basic ')) return challenge();

    let decoded;
    try {
      decoded = atob(authorization.slice(6));
    } catch {
      return challenge();
    }

    const separator = decoded.indexOf(':');
    if (separator < 0) return challenge();

    const username = decoded.slice(0, separator);
    const passwordHash = await digest(decoded.slice(separator + 1));
    const validUser = constantTimeEqual(username, expectedUser);
    const validPassword = constantTimeEqual(passwordHash, expectedPasswordHash);

    if (!validUser || !validPassword) return challenge();

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'private, no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
