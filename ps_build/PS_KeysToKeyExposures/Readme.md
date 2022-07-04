## PS_KeysToKeyExposures
v0.210924

### Description
This Script converts Node Attribute Animation to Drawing Node Exposure Keys.

### Usage
Select two nodes in Node View:
- The node from the attribute of which the animation data will be taken
- The Drawing Node in which the Exposure Keys will be generated
(Using a Drawing Node as animation source is not recommended)

If all goes well You'll see a modal with the fields described below:
- Drawing: the path to used Drawing Node
- Source: the path to used Animation Source Node
- Source Node Attribute Name: pick an animated attribute as an animation values source
- First Frame: The first frame from which Exposure Keys will be generated
- Last Frame: the last frame of creating Exposure Keys range
- Value Offset: the offset of animation source frame relative to the current frame to implement a Key Exposure delay
- Min Exposure: minimum Key Exposure duration in frames
- Key Exposures Mapping: here you need to specify which range of values the Exposure Keys correspond to. An example format will be generated the first time the script is applying to a Drawing Node.

Once configured, click the "Create Key Exposures" button. Voila!

The Key Exposures Mapping and other Script parameters related to a specific Drawing Node are stored in a Custom Attribute of that Node and will be used when the script is reapplied to that Drawing.

### Installation:
Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).\
Add the script "PS_KeysToKeyExposures" to a panel.  
