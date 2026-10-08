// Evaluate unpatched Kobalte Slider with real inputs and a range; D19/D90.
import { render } from '@solidjs/web';
import * as Slider from '@kobalte/core/slider';
function Probe(){return <form><Slider.Root defaultValue={[20,80]} name="volume" minStepsBetweenThumbs={10}><Slider.Label>Volume range</Slider.Label><Slider.Track style={{position:'relative',width:'300px',height:'20px',background:'#ddd'}}><Slider.Fill style={{position:'absolute',height:'100%',background:'#666'}}/><Slider.Thumb aria-label="Minimum" style={{width:'20px',height:'20px',background:'#333'}}><Slider.Input/></Slider.Thumb><Slider.Thumb aria-label="Maximum" style={{width:'20px',height:'20px',background:'#333'}}><Slider.Input/></Slider.Thumb></Slider.Track></Slider.Root><button type="reset">Reset</button></form>;}
render(()=><Probe/>,document.getElementById('app')!);
