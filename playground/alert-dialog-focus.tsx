// Focused Alert Dialog keyboard and nested-modal acceptance examples; D19/D90.
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from 'shadcn-solidjs-theme/ui/alert-dialog';
import { Button, buttonVariants } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';

/** Exercise independent native modal owners with explicit, stable focus destinations. */
export function AlertDialogFocus() {
  const forceMount = new URLSearchParams(location.search).has('force-mounted');
  return <main>
    <h1>Alert Dialog keyboard navigation</h1>
    <p>Open the parent preview, then explore its controls and nested confirmation with Tab and Shift+Tab.</p>
    <div class="samples mt-6">
      <Button>Before dialog</Button>
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Open parent confirmation</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Parent confirmation</AlertDialogTitle>
          <AlertDialogDescription>Your local draft stays available after closing the nested confirmation.</AlertDialogDescription>
          <Label for="parent-draft">Parent draft</Label><Input id="parent-draft" defaultValue="Keep this draft"/>
          <Button disabled>Unavailable action</Button>
          <button type="button" hidden>Hidden action</button>
          <Button tabindex={-1}>Pointer-only action</Button>
          <AlertDialog>
            <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Open nested confirmation</AlertDialogTrigger>
            <AlertDialogContent forceMount={forceMount} size="sm" data-testid="nested-content">
              <AlertDialogTitle>Nested confirmation</AlertDialogTitle>
              <AlertDialogDescription>Only this confirmation closes when you choose an action or press Escape.</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel nested</AlertDialogCancel>
                <AlertDialogAction>Confirm nested</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel parent</AlertDialogCancel>
            <AlertDialogAction>Confirm parent</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button>After dialog</Button>
    </div>
  </main>;
}
