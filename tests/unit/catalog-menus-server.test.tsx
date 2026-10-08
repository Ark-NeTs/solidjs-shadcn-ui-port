// Exercise server-only registration derivations; real SSR and hydration have separate gates; D19/D90.
import {it,expect,vi} from 'vitest';
import {render,screen} from '@solidjs/testing-library';
vi.mock('@solidjs/web',async original=>({...await original<typeof import('@solidjs/web')>(),isServer:true}));
import {Command,CommandInput,CommandList,CommandItem} from '../../src/components/ui/command';
it('Command server metadata resolves authored selection as entries register without a root memo snapshot',()=>{render(()=><Command defaultValue="two"><CommandInput/><CommandList><CommandItem value="one" disabled>One</CommandItem><CommandItem value="two">Two</CommandItem></CommandList></Command>);expect(screen.getByRole('option',{name:'Two'})).toHaveAttribute('aria-selected','true');expect(screen.getByRole('option',{name:'One'})).toHaveAttribute('aria-disabled','true');});
