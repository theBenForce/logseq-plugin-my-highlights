import { defineConfig, Plugin, ResolvedConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";
import WindiCSS from "vite-plugin-windicss";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import reactSvgPlugin from 'vite-plugin-react-svg';

// Hard-coded for now
// - assume index is "/src/main.tsx"
// - assume body has div#app
// - preamble code is better read from reactRefresh instead
const devIndexHtmlPlugin: () => Plugin = () => {
  let config: ResolvedConfig;
  return {
    name: "vite:logseq-dev-index-html-plugin",
    enforce: "pre",
    apply: "serve",
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig;
    },
    buildStart: async (opt) => {
      const template = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NVFJD2S');</script>
          <!-- End Google Tag Manager -->
          <base href="http://${config.server.host}:${config.server.port}">
          <meta charset="UTF-8" />
          <script type="module" src="/@vite/client"></script>
          <script type="module">
            import RefreshRuntime from "/@react-refresh";
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
          </script>
          <link rel="icon" type="image/svg+xml" href="icon.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>React Plugin</title>
        </head>
        <body>
        <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NVFJD2S"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->
          <div id="app"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>
      `;
      await mkdir(config.build.outDir, { recursive: true });
      await writeFile(
        path.resolve(config.build.outDir, "index.html"),
        template,
        {
          encoding: "utf-8",
        }
      );

      console.info("Wrote development index.html");
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactPlugin(),
    WindiCSS(),
    reactSvgPlugin({
      defaultExport: 'component'
    }),
    devIndexHtmlPlugin()
  ],
  base: "",
  clearScreen: false,
  // Makes HMR available for development
  server: {
    cors: true,
    host: "localhost",
    hmr: {
      host: "localhost",
    },
    port: 4567,
    strictPort: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
  },
});
