import { readFileSync } from 'node:fs';
import tls from 'node:tls';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The folder of the sibling infra repo, where its scripts/dev-setup.mjs creates the files.
const tlsFolder = '../infra/secrets/tls';

function readTlsFile(name: string) {
  try {
    return readFileSync(`${tlsFolder}/${name}`, 'utf8');
  } catch {
    throw new Error(
      `Cannot read ${tlsFolder}/${name}. Run "node scripts/dev-setup.mjs" in the infra repo first.`,
    );
  }
}

// In dev, /api and /ws are proxied to the API gateway (infra/).
// In production the gateway serves the frontend and the APIs from one origin.
export default defineConfig(({ command, mode }) => {
  // The build needs neither the gateway nor its certificate.
  if (command === 'build') {
    return { plugins: [react()] };
  }

  const env = loadEnv(mode, '.', '');
  const gateway = env.GATEWAY_URL || 'https://localhost:8443';

  // The proxy trusts the development CA that signed the certificate of the gateway.
  tls.setDefaultCACertificates([
    ...tls.getCACertificates('default'),
    readTlsFile('ca.crt'),
  ]);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // The cookies need HTTPS, and the certificate of the gateway is valid for localhost on any port.
      https: {
        cert: readTlsFile('gateway.crt'),
        key: readTlsFile('gateway.key'),
      },
      // The proxy keeps the Host header, because the gateway compares it
      // with the Origin header of a WebSocket handshake.
      proxy: {
        '/api': { target: gateway },
        '/ws': { target: gateway, ws: true },
      },
    },
  };
});
