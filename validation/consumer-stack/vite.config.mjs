// Isolated consumer dependencies never enter the design-system package; D19/D90.
import {defineConfig} from 'vite';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';
import {resolve} from 'node:path';
import {realpathSync} from 'node:fs';

const root=resolve(import.meta.dirname,'../..');
const dependencies=process.env.CONSUMER_DEPS_DIR??resolve(import.meta.dirname,'node_modules');
// Hosted VM profiling keeps all checks enabled with a measured timing allowance; see docs/CI.md.
export default defineConfig({root:import.meta.dirname,plugins:[solid({performanceTracks:process.env.CI==='true'?{attribution:{hotTime:{budgetMs:32,windowMs:1000}}}:true}),tailwind()],resolve:{dedupe:['solid-js','@solidjs/web','@solidjs/signals'],alias:[{find:'@solidjs/router',replacement:resolve(dependencies,'@solidjs/router/dist/index.js')},{find:'@tanstack/solid-query',replacement:resolve(dependencies,'@tanstack/solid-query/build/dev.js')},{find:/^shadcn-solidjs-theme\/ui\/(.+)$/,replacement:resolve(root,'src/components/ui/$1.tsx')}]},server:{host:'127.0.0.1',port:Number(process.env.THEME_PORT??4403),strictPort:true,fs:{allow:[root,realpathSync(resolve(root,'node_modules')),dependencies]}},build:{outDir:resolve(import.meta.dirname,'dist'),emptyOutDir:true}});
