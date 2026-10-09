// Check actual package exports against the admin's static imports; D19/D90.
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {auditAdminImports} from './admin-parity';
const packageRoot=resolve(import.meta.dirname,'..');
const report=auditAdminImports(packageRoot,resolve(packageRoot,'../../apps/admin/src'));
writeFileSync(resolve(packageRoot,'docs/evidence/admin-parity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&!report.complete)process.exitCode=1;
