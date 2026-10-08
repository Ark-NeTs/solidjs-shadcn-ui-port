// Native dropdown-menu with sibling-compatible compound export names; D19/D90.
import {MenuRoot,type MenuRootProps} from '../../lib/menu';
export type DropdownMenuProps=MenuRootProps;
/** Provide controlled or uncontrolled menu state to the compound parts. */
export function DropdownMenu(props:DropdownMenuProps){return <MenuRoot {...props} family="dropdown-menu"/>;}
export {MenuPortal as DropdownMenuPortal,MenuTrigger as DropdownMenuTrigger,MenuContent as DropdownMenuContent,MenuGroup as DropdownMenuGroup,MenuLabel as DropdownMenuLabel,MenuItem as DropdownMenuItem,MenuCheckboxItem as DropdownMenuCheckboxItem,MenuRadioGroup as DropdownMenuRadioGroup,MenuRadioItem as DropdownMenuRadioItem,MenuSeparator as DropdownMenuSeparator,MenuShortcut as DropdownMenuShortcut,MenuSub as DropdownMenuSub,MenuSubTrigger as DropdownMenuSubTrigger,MenuContent as DropdownMenuSubContent} from '../../lib/menu';
