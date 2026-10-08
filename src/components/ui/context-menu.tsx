// Native context-menu with sibling-compatible compound export names; D19/D90.
import {MenuRoot,type MenuRootProps} from '../../lib/menu';
export type ContextMenuProps=MenuRootProps;
/** Provide controlled or uncontrolled menu state to the compound parts. */
export function ContextMenu(props:ContextMenuProps){return <MenuRoot {...props} family="context-menu"/>;}
export {MenuPortal as ContextMenuPortal,MenuContextTrigger as ContextMenuTrigger,MenuContent as ContextMenuContent,MenuGroup as ContextMenuGroup,MenuLabel as ContextMenuLabel,MenuItem as ContextMenuItem,MenuCheckboxItem as ContextMenuCheckboxItem,MenuRadioGroup as ContextMenuRadioGroup,MenuRadioItem as ContextMenuRadioItem,MenuSeparator as ContextMenuSeparator,MenuShortcut as ContextMenuShortcut,MenuSub as ContextMenuSub,MenuSubTrigger as ContextMenuSubTrigger,MenuContent as ContextMenuSubContent} from '../../lib/menu';
