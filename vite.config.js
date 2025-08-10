import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// vite.config.js
export default {
  server: {
    allowedHosts: ["myllmmodel.com", "www.myllmmodel.com"],
    host: true,
    port: 4078, // or whatever you're using
  },
};
