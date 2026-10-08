// Reproduce the Kobalte acceptance probe with one Solid 2 runtime; D19.
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
export default defineConfig({plugins:[solid()],resolve:{dedupe:['solid-js','@solidjs/web','@solidjs/signals']},server:{host:'127.0.0.1',port:4405,strictPort:true}});
