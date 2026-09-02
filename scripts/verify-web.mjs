import { readFile } from 'node:fs/promises';

const repositoryRoot = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, repositoryRoot), 'utf8');

const [entry, v15, app, serviceWorker, security, dashboard, landing] = await Promise.all([
  read('app.html'),
  read('app-v15.html'),
  read('naknak-app.html'),
  read('naknak-sw.js'),
  read('.well-known/security.txt'),
  read('dashboard.html'),
  read('index.html'),
]);

const blankAnchors = [...dashboard.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)];
const unsafeBlankAnchors = blankAnchors.filter((match) => !/\brel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b/i.test(match[0]));

const checks = [
  ['app.html opens the direct build', entry.includes('./naknak-app.html')],
  ['v15 opens the direct build', v15.includes('./naknak-app.html')],
  ['service worker caches the direct build', serviceWorker.includes("'./naknak-app.html'")],
  ['compiled app contains SeniorHome', app.includes('function SeniorHome')],
  ['compiled app contains the pinned navigation', app.includes('className="nak-home-nav"')],
  ['compiled app contains the short-screen collapse', app.includes('@media (max-height:700px)')],
  ['compiled app contains flexible medication windows', app.includes('NAKNAK_FLEX_WINDOWS')],
  ['compiled app preserves inclusive roles', app.includes('Senior / PWD User') && app.includes('Caregiver / Anak User')],
  ['compiled app exposes direct phone calls', (app.match(/window\.location\.href="tel:"/g) || []).length >= 4],
  ['compiled app states caregiver beta limits', app.includes('Hindi pa aktibo ang remote SMS, automatic calling')],
  ['compiled app contains the compact caregiver dashboard', app.includes('className="nak-care-summary"')],
  ['compiled app separates caregiver status signals', app.includes('Check-in pending') && app.includes('Battery {s.battery}%')],
  ['compiled app contains safer medication removal', app.includes('Tanggalin ang {m.name}?')],
  ['compiled app contains responsive Family Code pairing', app.includes('className="nak-sync-form"') && app.includes('placeholder="XXXXXX"')],
  ['compiled app contains the structured blood-type grid', app.includes('className="nak-blood-grid"') && app.includes('aria-pressed={selected}')],
  ['compiled app improves dark navigation contrast', app.includes('const inactiveColor=t.isDark?"#D8B995"')],
  ['compiled app has no runtime GitHub source fetch', !app.includes('raw.githubusercontent.com/justineinacay/Naknak')],
  ['compiled app has no document.write wrapper', !app.includes('document.write(')],
  ['compiled app has no NakNak call overlay', !app.includes('function EmergencyCallOverlay')],
  ['security.txt has a contact', /^Contact:\s+mailto:\S+/m.test(security)],
  ['security.txt has a future expiration', (() => { const value = security.match(/^Expires:\s+(.+)$/m)?.[1]; return !!value && Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now(); })()],
  ['security.txt points to the security policy', /^Policy:\s+https:\/\/github\.com\/justineinacay\/Naknak\/blob\/main\/SECURITY\.md$/m.test(security)],
  ['checkout tab is opened with noopener and noreferrer', dashboard.includes('window.open(data.checkout_url, "_blank", "noopener,noreferrer")')],
  ['external blank links are isolated', unsafeBlankAnchors.length === 0],
  ['HTML referrer fallback is present', [app, dashboard, landing].every((html) => html.includes('name="referrer"') && html.includes('strict-origin-when-cross-origin'))],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exitCode = 1;
