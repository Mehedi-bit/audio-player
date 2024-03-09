import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Define server URL dynamically
  const serverUrl = env.SERVER_URL || 'http://localhost:5000';

  return defineConfig({
    plugins: [react()],
    host: true,
    server: {
      port: 3000,
    },
    base: env.VITE_ROUTER_BASE_URL || '/',
    define: {
      'process.env': {
        ...env,
        VITE_SERVER_URL: JSON.stringify(serverUrl) // Ensure server URL is a string
      },
    }
  });
};
