// Exercise OTP form contracts and callback lifetimes for the D19 library evaluation.
import { createSignal, Show } from 'solid-js';
import * as OTP from '@kobalte/core/otp-field';
import { useFormControl } from '@solid-primitives/a11y';
const params = new URLSearchParams(location.search);
/** Display the library's actual value, including uncontrolled resets. */
function OtpSlots() {
  const state = OTP.useOTPFieldContext();
  window.otpFormControl = useFormControl();
  return <><output data-testid="otp-value">{state.value()}</output><div class="slots" aria-hidden="true">{[0,1,2,3,4,5].map(index => <span data-active={state.activeSlots().includes(index)}>{state.value()[index] || '·'}</span>)}</div></>;
}
/** Exercise input ownership, label/ARIA registration, native validation and reset. */
export function OtpProbe() {
  const initial = params.get('default') || '';
  const [value, setValue] = createSignal(initial);
  const [submitted, setSubmitted] = createSignal('');
  const [disabled, setDisabled] = createSignal(false);
  const [readOnly, setReadOnly] = createSignal(false);
  const [required, setRequired] = createSignal(false);
  const [invalid, setInvalid] = createSignal(false);
  const [showText, setShowText] = createSignal(false);
  const [rootId, setRootId] = createSignal(undefined);
  const [name, setName] = createSignal('code');
  const [inputProps, setInputProps] = createSignal(params.has('wire') ? {id:'explicit-code',name:'code'} : {});
  window.__otpCompletions = [];
  window.__otpChanges = [];
  window.otpControl = {setValue,setDisabled,setReadOnly,setRequired,setInvalid,setShowText,setRootId,setName,setInputProps};
  return <>
    <output data-testid="submitted">{submitted()}</output>
    <span id="external-otp-label">External label</span><span id="external-otp-hint">External hint</span>
    <form onReset={event => { if(params.has('cancelReset')) event.preventDefault(); }} onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get(name()))); }}>
      <OTP.Root {...(rootId() ? {id:rootId()} : {})} maxLength={6} {...(params.has('uncontrolled') ? {defaultValue:initial} : {get value(){return value()},defaultValue:initial})}
        onChange={next => {window.__otpChanges.push(next);if(!params.has('uncontrolled'))setValue(next);}}
        onComplete={next => window.__otpCompletions.push(next)} name={name()} disabled={disabled()} readOnly={readOnly()} required={required()} validationState={invalid() ? 'invalid' : undefined}>
        <OTP.Label data-testid="otp-label" style={{"pointer-events":"auto"}} {...(params.has('wire') ? {for:'explicit-code'} : {})}>Verification code</OTP.Label>
        <div class="otp"><OTP.Input {...inputProps()} /><OtpSlots /></div>
        <Show when={showText()}><OTP.Description data-testid="otp-description">Enter six digits.</OTP.Description><OTP.ErrorMessage data-testid="otp-error">Try another code.</OTP.ErrorMessage></Show>
      </OTP.Root>
      <button type="submit">Submit code</button><button type="reset">Reset code</button>
    </form>
    <button onClick={() => setValue('987654')}>Set external value</button><button onClick={() => setDisabled(!disabled())}>Toggle disabled</button>
  </>;
}
