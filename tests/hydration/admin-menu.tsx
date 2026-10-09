// Render the same admin composition on server and client with isolated local services.
import {AdminMenuContent} from '../../playground/admin-menu';
import {createDemoMenuApi} from '../../playground/admin-menu-model';
export function AdminMenuHydration(){const api=createDemoMenuApi(()=>'accept',()=>{});return <main><h1>Hydrated menu management</h1><AdminMenuContent api={api}/></main>;}
