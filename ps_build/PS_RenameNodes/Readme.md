## PS_RenameNodes
v0.210529

### Description
A small helper for batch renaming of nodes.

### Usage
* Select nodes to rename
* Click the Script button

If there is only one Drawing in the selection, its name will be used as the base name.
* Otherwise, if there is only one Group in the selection, its name will be used as the base name.
* Otherwise, if there is only one Composite in the selection, its name will be used as the base name.
* Otherwise, the base name input field will be displayed (hold the Control key to force its appearance )

The default rename template is "<BASE-NAME>_<NODE-SHORT-TYPE>_<N>".
Hold Alt key to use short name templates ( like "AP_1" for "Auto Patch" ).

You can change templates in the script body.

### Installation:
Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).\
Add script "PS_RenameNodes" to a panel.\
