// Preview/export parity and safe URL configuration for the documentation generator.
import {describe,it,expect,vi} from 'vitest';
import {themeDefaults,themeKeys,themeOptions,readTheme,themeTokens,themeCSS,shuffleTheme} from '../../playground/theme-model';
// Vitest stubs CSS imports; use the real canonical file for token contract tests.
vi.mock('../../src/theme.css?raw',async()=>({default:(await import('node:fs')).readFileSync('src/theme.css','utf8')}));
describe('theme generator tokens',()=>{
 it('rejects unknown URL values and arbitrary CSS',()=>{expect(readTheme(new URLSearchParams('accent=red;bad&font=url(x)&radius=99'))).toEqual(themeDefaults);expect(readTheme(new URLSearchParams('accent=Rose&base=Slate')).accent).toBe('Rose');});
 it('exports every preview token for both modes and resolves aliases',()=>{for(const accent of themeOptions.accent){const settings={...themeDefaults,accent};const css=themeCSS(settings);for(const dark of [false,true]){const tokens=themeTokens(settings,dark);expect(Object.keys(tokens).length).toBeGreaterThan(35);for(const [key,value] of Object.entries(tokens)){expect(value).toBeTruthy();expect(css).toContain(`${key}: ${value};`);}if(accent!=='Neutral')expect(tokens['--sidebar-primary']).toBe(tokens['--primary']);}expect(css).toContain('.dark {');}});
 it('handles all base palettes, chart colors, fonts, radii and densities without invalid declarations',()=>{for(const key of themeKeys)for(const value of themeOptions[key]){const css=themeCSS({...themeDefaults,[key]:value});expect(css).not.toMatch(/undefined|NaN|url\(/);expect(css).toContain('--font-heading:');expect(css).toContain('--chart-5:');}});
 it('shuffles only unlocked settings without changing its inputs',()=>{const original={...themeDefaults};const changed=shuffleTheme(original,{accent:true,font:true},()=>.999);expect(changed.accent).toBe(original.accent);expect(changed.font).toBe(original.font);expect(changed.radius).toBe('Full');expect(original).toEqual(themeDefaults);});
});
