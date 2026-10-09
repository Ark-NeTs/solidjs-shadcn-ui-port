// Check actual package exports against the admin's static imports; D19/D90.
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {auditAdminImports} from './admin-parity';
const packageRoot=resolve(import.meta.dirname,'..');
const argument=process.argv.indexOf('--app-root');
if(argument!==-1&&(!process.argv[argument+1]||process.argv[argument+1]!.startsWith('--')))throw new Error('--app-root requires an application source directory.');
const appRoot=argument===-1?resolve(packageRoot,'validation/admin-imports'):resolve(process.argv[argument+1]!);
const report=auditAdminImports(packageRoot,appRoot);
writeFileSync(resolve(packageRoot,'docs/evidence/admin-parity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&!report.complete)process.exitCode=1;
