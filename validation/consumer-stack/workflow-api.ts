// Consumer-owned HTTP contract; no application transport enters the UI package.
export type WorkflowItem = {id: string; name: string; priceCents: number; version: number};
export type SaveResult = {accepted: true; item: WorkflowItem} | {accepted: false; message: string};

export async function readItems(session: string, signal: AbortSignal): Promise<WorkflowItem[]> {
 const response = await fetch(`/api/workflow/${encodeURIComponent(session)}/items`, {signal});
 if (!response.ok) throw new Error('Could not load menu items.');
 return response.json();
}

export async function saveItem(session: string, item: WorkflowItem, signal: AbortSignal): Promise<SaveResult> {
 const response = await fetch(`/api/workflow/${encodeURIComponent(session)}/items`, {
  method: 'PUT', signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(item),
 });
 if (!response.ok) throw new Error('Save outcome is unknown. Reload before saving again.');
 const result: SaveResult = await response.json();
 if (typeof result.accepted !== 'boolean') throw new Error('Save outcome is unknown. Reload before saving again.');
 return result;
}
