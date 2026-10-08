// Plain Solid retry differential: two promises, one native input, no package components; D19/D90.
import { createMemo, createSignal, Errored, Loading, untrack } from 'solid-js';
export const retryModes = ['replace-reset', 'replace-only', 'source-reset'] as const;
export type RetryMode = typeof retryModes[number];
/** Hold exactly one asynchronous result until its native harness control settles it. */
function request(id: number) {
  let resolve!: (value: string) => void;let reject!: (error: Error) => void;
  const promise = new Promise<string>((done, fail) => { resolve = done;reject = fail; });
  return { id, promise, resolve: () => resolve(`Ready ${id}`), reject: () => reject(new Error(`Failed ${id}`)) };
}
/** Keep the asynchronous source under the real boundaries. */
function Value(props: { read: () => Promise<string> }) {
  const value = createMemo(() => props.read());
  return <p data-testid="ready">{value()}</p>;
}
/** Compare replacing reactive request state with recomputing an imperative request source. */
export function MinimalRetry(props: { mode: RetryMode }) {
  const mode = untrack(() => props.mode);
  const first = request(1);const second = request(2);
  const [current, setCurrent] = createSignal(first);
  let source = first;
  /** Keep both settlement controls available even if a pending transaction holds the old view. */
  function retry(reset: () => void) {
    if (mode === 'source-reset') source = second;else setCurrent(second);
    if (mode !== 'replace-only') reset();
  }
  return <main>
    <input aria-label="Draft" value="Server draft"/>
    <button onClick={first.reject}>Reject first</button><button onClick={second.resolve}>Resolve second</button>
    <span data-testid="request">{current().id}</span>
    <Errored fallback={(error, reset) => <div><p role="alert">{String(error())}</p><button onClick={() => retry(reset)}>Retry</button></div>}>
      <Loading fallback={<p role="status">Pending</p>}>
        <Value read={() => mode === 'source-reset' ? source.promise : current().promise}/>
      </Loading>
    </Errored>
  </main>;
}
