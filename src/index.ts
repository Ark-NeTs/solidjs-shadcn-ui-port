// Barrel entry for the shadcn-solidjs-theme design system (D49, D19).
// Importing the theme here so the Vite library build emits the compiled Tailwind
// CSS (dist/shadcn-solidjs-theme.css) alongside the component bundle. Apps
// normally import components one-by-one via subpath exports
// (`shadcn-solidjs-theme/button`) and the theme via
// `shadcn-solidjs-theme/theme.css`; this barrel backs the optional prebuilt `.`
// bundle for consumers that want the whole set from a single specifier.
import './theme.css';

export { cn } from './lib/utils';

export * from './components/ui/accordion';
export * from './components/ui/alert';
export * from './components/ui/alert-dialog';
export * from './components/ui/badge';
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/checkbox';
export * from './components/ui/collapsible';
export * from './components/ui/dialog';
export * from './components/ui/drawer';
export * from './components/ui/dropdown-menu';
export * from './components/ui/label';
export * from './components/ui/number-field';
export * from './components/ui/popover';
export * from './components/ui/select';
export * from './components/ui/separator';
export * from './components/ui/sheet';
export * from './components/ui/skeleton';
export * from './components/ui/sonner';
export * from './components/ui/switch';
export * from './components/ui/table';
export * from './components/ui/tabs';
export * from './components/ui/text-field';
export * from './components/ui/toggle';
export * from './components/ui/toggle-group';
export * from './components/ui/tooltip';
