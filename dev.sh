#!/usr/bin/env bash

mkdir -p dist
touch dist/proxyServer.js
concurrently \
  'tsc --esModuleInterop --outDir ./dist --watch src/proxyServer.ts' \
  'nodemon -q dist/proxyServer.js' \
  'vite' \
  'cd packages/react && watch "npm run build" src' \
  'cd packages/objects && watch "npm run build" src' \
  'cd packages/core && watch "npm run build" src' \
  'cd packages/types && watch "npm run build" src'
