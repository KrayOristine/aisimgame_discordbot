import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    root: "./src",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      },
    },
    build: {
      target: "node25",
      outDir: "../dist",
      emptyOutDir: true,
      sourcemap: false,
      rolldownOptions: {
        output: {
          minify: true,
          sourcemap: false,
          comments: {
            legal: true,
            annotation: false,
            jsdoc: false,
          },
          codeSplitting: {
            maxSize: 1024 * 1024 * 5,
            groups: [
              {
                test: /node_modules[\\/].*google/i,
                name: "google",
                priority: 9999
              },
              {
                test: /node_modules[\\/]@?discord\.?js/i,
                name: "djs",
                priority: 6969,
                entriesAware: true,
              },
              {
                test: /node_modules[\\/]@?mongodb/i,
                name: "mongodb",
                priority: 9696,
                entriesAware: true,
              },
              {
                test: /node_modules[\\/]/i,
                name: "vendor",
              },
              {
                test: /[\\/]services[\\/]/i,
                name: "core",
                entriesAware: true,
              },
            ],
          },
        },
      },
    },
  };
});
