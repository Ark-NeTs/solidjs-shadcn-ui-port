// Consumer workflow against freshly built package/gallery assets; D19/D90.
import { test, expect } from '../browser-fixture';
test('built Combobox searches, commits, resets and recovers a rejected change',async({page})=>{
 await page.goto('/');const fruit=page.getByRole('combobox',{name:'Favorite fruit'});await fruit.fill('Ban');await fruit.press('ArrowDown');await fruit.press('Enter');await page.getByRole('button',{name:'Submit fruit'}).click();await expect(page.getByText('Submitted fruit: Banana')).toBeVisible();await page.getByRole('button',{name:'Reset fruit'}).click();await expect(fruit).toHaveValue('Apple');await page.getByRole('combobox',{name:'Restricted fruit'}).scrollIntoViewIfNeeded();await page.getByRole('combobox',{name:'Restricted fruit'}).fill('Ban');await page.getByRole('option',{name:'Banana',exact:true}).click();await expect(page.getByRole('combobox',{name:'Restricted fruit'})).toHaveValue('Apple');
});

import { comboboxContracts } from '../combobox-contracts';
comboboxContracts();

import { comboboxNavigation } from '../combobox-navigation';
comboboxNavigation();
