/**
 * Resolve mongodb+srv:// using DNS-over-HTTPS (Cloudflare 1.1.1.1).
 * Bypasses broken local UDP / SRV resolution on some Windows setups.
 */

const CLOUDFLARE_DOH =
  'https://cloudflare-dns.com/dns-query';
const GOOGLE_DOH_JSON =
  'https://dns.google/resolve';

const DNS_TYPES = { SRV: 33, TXT: 16 };

async function dnsJsonCloudflare(name, type) {
  const url = new URL(CLOUDFLARE_DOH);
  url.searchParams.set('name', name);
  url.searchParams.set('type', String(type));

  const res = await fetch(url, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Cloudflare DoH HTTP ${res.status}`);
  }
  const body = await res.json();
  if (body.Status !== 0 || !body.Answer?.length) {
    throw new Error(
      `Cloudflare DoH failed for ${name} type=${type} status=${body.Status}`
    );
  }
  return body.Answer;
}

async function dnsJsonGoogle(name, type) {
  const url = new URL(GOOGLE_DOH_JSON);
  url.searchParams.set('name', name);
  url.searchParams.set('type', String(type));

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`Google DoH HTTP ${res.status}`);
  }
  const body = await res.json();
  if (body.Status !== 0 || !body.Answer?.length) {
    throw new Error(
      `Google DoH failed for ${name} type=${type} status=${body.Status}`
    );
  }
  return body.Answer;
}

async function dnsJson(name, type) {
  try {
    return await dnsJsonCloudflare(name, type);
  } catch (e1) {
    return await dnsJsonGoogle(name, type);
  }
}

function parseSrvRdata(data) {
  const s = String(data).trim().replace(/\.$/, '');
  const parts = s.split(/\s+/);
  if (parts.length < 4) throw new Error(`Bad SRV rdata: ${data}`);
  return {
    priority: Number(parts[0]),
    weight: Number(parts[1]),
    port: Number(parts[2]),
    target: parts.slice(3).join(' ').replace(/\.$/, '').trim(),
  };
}

/** Parse TXT answer "data" from Cloudflare JSON (quoted string). */
function parseTxt_rdata(data) {
  const raw = String(data).trim();
  try {
    return JSON.parse(raw);
  } catch {
    return raw.replace(/^"(.*)"$/, '$1');
  }
}

/**
 * Parses mongodb+svr credentials + host + path + query.
 * Auth uses last `@` separator (RFC 3986-encoded password).
 */
function parseMongoSrv(connectionString) {
  const prefix = 'mongodb+srv://';
  if (!connectionString.startsWith(prefix)) {
    throw new Error('Not a mongodb+srv URI');
  }
  const rest = connectionString.slice(prefix.length);
  const at = rest.lastIndexOf('@');

  let user = '';
  let password = '';
  let remainder = rest;
  if (at !== -1) {
    const creds = rest.slice(0, at);
    remainder = rest.slice(at + 1);

    const colon = creds.indexOf(':');
    if (colon === -1) {
      user = decodeURIComponent(creds);
    } else {
      user = decodeURIComponent(creds.slice(0, colon));
      password = decodeURIComponent(creds.slice(colon + 1));
    }
  }

  const hostMatch = /^([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(remainder);
  if (!hostMatch) throw new Error('Could not parse mongodb+srv host segment');

  const hostname = hostMatch[1];
  const pathname = hostMatch[2] || '';
  const qs = hostMatch[3] ? hostMatch[3].slice(1) : '';

  const defaultDb = pathname && pathname !== '/' ? pathname.slice(1) : '';

  return { user, password, hostname, pathname, pathnameWithSlash: pathname || '', defaultDb, queryString: qs };
}

/** Build mongodb:// URI from srv + DNS-over-HTTPS answers. */
async function resolveSrvMongoUriViaHttps(originalSrvUri) {
  const { user, password, hostname, pathnameWithSlash, queryString } = parseMongoSrv(
    originalSrvUri.trim()
  );

  const srvName = `_mongodb._tcp.${hostname}`;

  const [srvAnswers, txtAnswers] = await Promise.all([
    dnsJson(srvName, DNS_TYPES.SRV),
    dnsJson(srvName, DNS_TYPES.TXT),
  ]);

  const hosts = srvAnswers
    .filter((a) => a.type === DNS_TYPES.SRV)
    .map((a) => parseSrvRdata(a.data))
    .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    .map((rec) => `${rec.target}:${rec.port}`)
    .join(',');

  if (!hosts) throw new Error('SRV DNS-over-HTTPS returned no usable hosts');

  const txtPieces = txtAnswers
    .filter((a) => a.type === DNS_TYPES.TXT)
    .map((a) => parseTxt_rdata(a.data))
    .filter(Boolean);

  const merged = new URLSearchParams(txtPieces.join('&'));
  const uriQs = new URLSearchParams(queryString);
  uriQs.forEach((v, k) => merged.set(k, v));

  if (!merged.has('tls') && !merged.has('ssl')) merged.set('tls', 'true');

  const auth =
    user !== ''
      ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
      : '';

  const pathPart = pathnameWithSlash || '/';
  const standard = `mongodb://${auth}${hosts}${pathPart}?${merged.toString()}`;
  return standard;
}

module.exports = { resolveSrvMongoUriViaHttps, parseMongoSrv };
