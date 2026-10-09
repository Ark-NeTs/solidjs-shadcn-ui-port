// Deterministic, allowlisted theme settings shared by preview and CSS export; D19/D90.
import canonical from '../src/theme.css?raw';
export const themeOptions={
 base:['Neutral','Zinc','Slate','Stone','Gray'],
 accent:['Neutral','Blue','Green','Orange','Rose','Violet','Yellow'],
 chart:['Neutral','Blue','Green','Orange','Rose','Violet','Yellow'],
 heading:['Inter','System','Serif','Mono'],
 font:['Inter','System','Serif','Mono'],
 radius:['None','Small','Medium','Large','Full'],
 density:['Comfortable','Compact'],
} as const;
export type ThemeKey=keyof typeof themeOptions;
export type ThemeSettings=Record<ThemeKey,string>;
export const themeDefaults:ThemeSettings={base:'Neutral',accent:'Neutral',chart:'Neutral',heading:'Inter',font:'Inter',radius:'Medium',density:'Comfortable'};
export const themeKeys=Object.keys(themeOptions) as ThemeKey[];
const hues:Record<string,number>={Blue:255,Green:155,Orange:45,Rose:15,Violet:295,Yellow:95};
const fonts:Record<string,string>={Inter:"'Inter Variable', sans-serif",System:'system-ui, sans-serif',Serif:'Georgia, serif',Mono:'ui-monospace, monospace'};
/** URL settings are data, never arbitrary CSS; unknown values return to safe defaults. */
export function readTheme(params:URLSearchParams):ThemeSettings{return Object.fromEntries(themeKeys.map(key=>[key,(themeOptions[key] as readonly string[]).includes(params.get(key)??'')?params.get(key):themeDefaults[key]])) as ThemeSettings;}
/** Read only the canonical semantic declaration blocks, preserving the package contract. */
function canonicalTokens(dark:boolean):Record<string,string>{const block=canonical.match(dark?/\.dark\s*\{([^}]+)\}/:/:root\s*\{([^}]+)\}/)![1]!;return Object.fromEntries(Array.from(block.matchAll(/(--[\w-]+):\s*([^;]+);/g),match=>[match[1]!,match[2]!]));}
/** Produce exactly the same token map for the canvas and the exported stylesheet. */
export function themeTokens(settings:ThemeSettings,dark:boolean):Record<string,string>{
 const tokens=canonicalTokens(dark);const base:Record<string,[number,number]>={Zinc:[.006,286],Slate:[.018,255],Stone:[.01,65],Gray:[.008,260]};
 if(base[settings.base]){const [chroma,hue]=base[settings.base]!;for(const key of Object.keys(tokens)){if(key.includes('destructive')||key.startsWith('--chart'))continue;tokens[key]=tokens[key]!.replace(/oklch\(([\d.]+) [\d.]+ [\d.]+/,`oklch($1 ${chroma} ${hue}`);}}
 const hue=hues[settings.accent];if(hue!==undefined){const bright=settings.accent==='Yellow';tokens['--primary']=`oklch(${dark||bright ? .78 : .48} ${bright ? .16 : .15} ${hue})`;tokens['--primary-foreground']=dark||bright?'oklch(0.15 0 0)':'oklch(0.99 0 0)';tokens['--ring']=tokens['--primary']!;tokens['--accent']=`oklch(${dark ? .28 : .95} 0.035 ${hue})`;tokens['--accent-foreground']=tokens['--foreground']!;tokens['--sidebar-primary']=tokens['--primary']!;tokens['--sidebar-primary-foreground']=tokens['--primary-foreground']!;tokens['--sidebar-ring']=tokens['--ring']!;tokens['--sidebar-accent']=tokens['--accent']!;}
 const chartHue=hues[settings.chart];for(let i=1;i<=5;i++)tokens[`--chart-${i}`]=chartHue===undefined?`oklch(${Number((.8-i*.09).toFixed(3))} 0 0)`:`oklch(${Number((.8-i*.065).toFixed(3))} 0.15 ${(chartHue+(i-1)*12)%360})`;
 tokens['--radius']=({None:'0rem',Small:'0.25rem',Medium:'0.625rem',Large:'1rem',Full:'1.5rem'} as Record<string,string>)[settings.radius]!;
 tokens['--font-sans']=fonts[settings.font]!;tokens['--font-heading']=fonts[settings.heading]!;tokens['--spacing']=settings.density==='Compact'?'0.2rem':'0.25rem';return tokens;
}
/** Export both appearances regardless of which mode is currently visible. */
export function themeCSS(settings:ThemeSettings):string{return [false,true].map(dark=>`${dark?'.dark':':root'} {\n${Object.entries(themeTokens(settings,dark)).map(([key,value])=>`  ${key}: ${value};`).join('\n')}\n}`).join('\n\n');}
/** Locked settings survive shuffle; randomness can be injected for deterministic tests. */
export function shuffleTheme(settings:ThemeSettings,locked:Partial<Record<ThemeKey,boolean>>,random= Math.random):ThemeSettings{return Object.fromEntries(themeKeys.map(key=>[key,locked[key]?settings[key]:themeOptions[key][Math.floor(random()*themeOptions[key].length)%themeOptions[key].length]])) as ThemeSettings;}
