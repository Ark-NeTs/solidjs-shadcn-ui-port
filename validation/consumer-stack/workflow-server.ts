// Deterministic HTTP test service, scoped to this isolated Vite consumer only.
import {randomUUID} from 'node:crypto';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';
import type {WorkflowItem} from './workflow-api.js';

type Session = {items: WorkflowItem[]; reads: number; saves: number; reject: boolean; hold: boolean; unreadable: boolean; release?: () => void};
async function body(request: IncomingMessage) {
 let text = '';
 for await (const chunk of request) text += chunk;
 return JSON.parse(text || '{}');
}
function json(response: ServerResponse, value: unknown, status = 200) {
 response.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
 response.end(JSON.stringify(value));
}

export function workflowServer(): Plugin {
 const sessions = new Map<string, Session>();
 return {name: 'isolated-workflow-api', configureServer(server) {
  server.httpServer?.once('close', () => {for (const session of sessions.values()) session.release?.(); sessions.clear();});
  server.middlewares.use((request, response, next) => {
   const path = new URL(request.url ?? '/', 'http://localhost').pathname;
   if (!path.startsWith('/api/workflow/')) return next();
   void (async () => {
    if (path === '/api/workflow/sessions' && request.method === 'POST') {
     const id = randomUUID();
     sessions.set(id, {items: [
      {id: 'dish-1', name: 'Margherita pizza', priceCents: 1200, version: 1},
      {id: 'dish-2', name: 'Lemon chicken', priceCents: 1600, version: 1},
     ], reads: 0, saves: 0, reject: false, hold: false, unreadable: false});
     return json(response, {id});
    }
    const [, , , id, action] = path.split('/');
    const session = sessions.get(id ?? '');
    if (!session) return json(response, {message: 'Unknown test session'}, 404);
    if (action === 'control' && request.method === 'POST') {
     const control = await body(request);
     session.reject = control.reject === true; session.hold = control.hold === true;
     session.unreadable = control.unreadable === true;
     if (control.release) {session.release?.(); session.release = undefined;}
     return json(response, {ready: true});
    }
    if (action === 'state' && request.method === 'GET') return json(response, {items: session.items, reads: session.reads, saves: session.saves});
    if (action === 'items' && request.method === 'GET') {session.reads++; return json(response, session.items);}
    if (action === 'items' && request.method === 'PUT') {
     const item: WorkflowItem = await body(request); session.saves++;
     const reject = session.reject, hold = session.hold, unreadable = session.unreadable; session.reject = false; session.hold = false; session.unreadable = false;
     if (hold) await new Promise<void>(resolve => {session.release = resolve;});
     if (reject) return json(response, {accepted: false, message: 'The server rejected this save. Your draft is preserved; review it and try again.'});
     const current = session.items.find(row => row.id === item.id);
     if (!current || current.version !== item.version) return json(response, {accepted: false, message: 'This item changed on the server. Cancel and reopen it after reloading.'});
     if (!item.name.trim() || !Number.isSafeInteger(item.priceCents) || item.priceCents <= 0) return json(response, {accepted: false, message: 'Use a name and a positive price.'});
     const saved = {...item, name: item.name.trim(), version: current.version + 1};
     session.items = session.items.map(row => row.id === saved.id ? saved : row);
     if (unreadable) return json(response, {message: 'Acknowledgement unavailable'});
     return json(response, {accepted: true, item: saved});
    }
    return json(response, {message: 'Unknown test endpoint'}, 404);
   })().catch(() => {if (!response.headersSent) json(response, {message: 'Invalid test request'}, 400); else response.end();});
  });
 }};
}
