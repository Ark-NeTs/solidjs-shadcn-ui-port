// Preserve the reference's seven-column canvas and nested center composition; D19/D90.
import {LeftColumn,SecondColumn} from './theme-preview-left';
import {CenterColumns} from './theme-preview-center';
import {FifthColumn,SixthColumn,SeventhColumn} from './theme-preview-right';
export function ThemeCanvas(){return <div class="theme-canvas"><div class="theme-preview-grid"><LeftColumn/><SecondColumn/><CenterColumns/><FifthColumn/><SixthColumn/><SeventhColumn/></div></div>;}
