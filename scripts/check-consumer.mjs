// Check the isolated consumer against its installed package types; D19/D90.
import ts from 'typescript';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');const dependencies=process.env.CONSUMER_DEPS_DIR??resolve(root,'validation/consumer-stack/node_modules');
const config=ts.readConfigFile(resolve(root,'tsconfig.json'),ts.sys.readFile);const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
const options={...parsed.options,paths:{...parsed.options.paths,'@solidjs/router':[resolve(dependencies,'@solidjs/router/dist/index.d.ts')],'@tanstack/solid-query':[resolve(dependencies,'@tanstack/solid-query/build/index.d.ts')]}};
const diagnostics=ts.getPreEmitDiagnostics(ts.createProgram([resolve(root,'validation/consumer-stack/main.tsx'),resolve(root,'validation/consumer-stack/consumer.spec.ts')],options));
if(diagnostics.length){console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:file=>file,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));process.exitCode=1;}else console.log('Isolated consumer types passed.');
