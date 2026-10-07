// Real-browser component composition, semantic state and token integration; D19.
import { test, expect } from '../browser-fixture';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();});
test('keyboard activation, focus ring, disabled examples and navigation',async({page})=>{
  const theme=page.getByRole('button',{name:'Dark mode'});await theme.focus();
  expect(await theme.evaluate(el=>getComputedStyle(el).boxShadow)).not.toBe('none');
  await page.keyboard.press('Space');await expect(page.getByTestId('theme')).toHaveClass(/dark/);
  await page.getByRole('button',{name:'Disable examples'}).click();await expect(page.getByRole('button',{name:'default',exact:true})).toBeDisabled();
  await page.getByRole('link',{name:'Explore components'}).click();await expect(page).toHaveURL(/#components$/);
});
test('card size and separator orientation update geometry and semantics',async({page})=>{
  const card=page.getByTestId('example-card');const before=await card.evaluate(el=>getComputedStyle(el).paddingTop);
  await page.getByRole('button',{name:'Toggle compact card'}).click();await expect(card).toHaveAttribute('data-size','sm');expect(await card.evaluate(el=>getComputedStyle(el).paddingTop)).not.toBe(before);
  const separator=page.getByRole('separator');await expect(separator).toHaveAttribute('aria-orientation','horizontal');
  await page.getByRole('button',{name:'Change orientation'}).click();await expect(separator).toHaveAttribute('aria-orientation','vertical');const box=await separator.boundingBox();expect(box?.width).toBe(1);expect(box?.height).toBe(24);
});
test('custom theme changes token-driven button colors',async({page})=>{
  const button=page.getByRole('button',{name:'default',exact:true});const before=await button.evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.getByRole('button',{name:'Custom theme'}).click();expect(await button.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(before);
});
test('loading placeholders are hidden from accessibility tree and stop motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Save changes',exact:true}).click();
  const skeletons=page.locator('[data-slot="skeleton"]');await expect(skeletons).toHaveCount(3);
  for(const skeleton of await skeletons.all()){await expect(skeleton).toHaveAttribute('aria-hidden','true');expect(await skeleton.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');}
});
for(const mode of ['light','dark'])test(`${mode} examples have no axe accessibility violations`,async({page})=>{
  if(mode==='dark')await page.getByRole('button',{name:'Dark mode'}).click();
  // Audit settled colors, not the intermediate frames of the theme transition.
  await page.evaluate(()=>Promise.all(document.getAnimations().filter(animation=>animation.effect?.getTiming().iterations!==Infinity).map(animation=>animation.finished.catch(()=>undefined))));
  const result=await new AxeBuilder({page}).analyze();expect(result.violations).toEqual([]);
});
