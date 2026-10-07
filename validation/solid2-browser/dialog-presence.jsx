// Isolate Dialog presence and ID propagation for the D19 Kobalte evaluation; no production exports.
import { createSignal, Show } from 'solid-js';
import * as Dialog from '@kobalte/core/dialog';
import { createPresence } from '@solid-primitives/presence';
const params = new URLSearchParams(location.search);
/** Omit absent IDs: Solid 2 merge treats a supplied undefined as an explicit override. */
function idProps(id) { return id === undefined ? {} : {id}; }
/** Observe the public context without mirroring it into another signal. */
function DialogState() {
  const state = Dialog.useDialogContext();
  window.dialogIdRegistration = state;
  return <output data-testid="dialog-state">{String(state.isOpen())}</output>;
}
/** Remove Drawer gestures and transitions while retaining the same DialogRoot. */
export function DialogProbe() {
  const [open, setOpen] = createSignal(params.has('initial'));
  const [forceMount, setForceMount] = createSignal(params.has('force'));
  const [rootId, setRootId] = createSignal(undefined);
  const [partIds, setPartIds] = createSignal({});
  const [showText, setShowText] = createSignal(true);
  window.dialogControl = { setOpen, setForceMount, setRootId, setPartIds, setShowText };
  window.__dialogEvents = [];
  return <>
    <Dialog.Root {...idProps(rootId())} {...(params.has('uncontrolled') ? {defaultOpen:params.has('initial')} : {get open(){return open()},onOpenChange:setOpen})} forceMount={forceMount()}>
      <DialogState />
      <Dialog.Trigger>Open plain dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="overlay plain-overlay" data-testid="plain-overlay" />
        <Dialog.Content {...idProps(partIds().content)} class="drawer plain-dialog" data-testid="plain-dialog" onOpenAutoFocus={() => { window.__dialogEvents.push('open-focus'); }} onCloseAutoFocus={() => { window.__dialogEvents.push('close-focus'); }}>
          <Show when={showText()}><Dialog.Title {...idProps(partIds().title)} data-testid="plain-title">Plain dialog</Dialog.Title>
          <Dialog.Description {...idProps(partIds().description)} data-testid="plain-description">Presence without Drawer state.</Dialog.Description></Show>
          <label>Plain input<input aria-label="Plain input" /></label>
          <Dialog.CloseButton>Close plain dialog</Dialog.CloseButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    <button>Outside dialog</button>
  </>;
}
/** Reproduce the original zero-duration helper independently of Kobalte. */
export function PresenceProbe() {
  const [active, setActive] = createSignal(false);
  const presence = createPresence(() => active() || undefined, {transitionDuration:0});
  return <>
    <button onClick={() => setActive(!active())}>Toggle presence</button>
    <output data-testid="presence-mounted">{String(presence.isMounted())}</output>
  </>;
}
