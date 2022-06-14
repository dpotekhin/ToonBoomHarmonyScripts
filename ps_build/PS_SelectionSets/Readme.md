## PS_SelectionSets
v0.220614

### Description
This script lets you to save and use groups of node selection sets (SS).

### Usage
Open the Selection Sets window by clicking the script button.

#### Sets Group (SSG).

Right mouse click (RMB) in an empty window space or on an existing SSG menu item and select "Create Group".
In the window that appears, select the parent group node for creating the data node and the name of the SSG to be created.

The SSG data is stored in the Note node. Therefore, they are remaining when you drag and drop the parent group node or the SSG data node itself. If necessary, you can edit that data manually.

##### SSG menu item interaction:
- RMB click on SSG item brings up the context menu for that SSG.


#### Selection Set (SS)

You can create a SS by RMB click on SSG in which you want to create a SS and select one of the context menu items:
- "Create Selection Set from Selection": creates a new SS from the curently selected nodes
- "Create Empty Selection Set": creates an empty SS

##### SS menu item interaction:
- LMB click on SS menu item: selects nodes contained in the SS
  - \+ Ctrl: adds selected nodes to the SS
  - \+ Shift: removes the selected nodes from the SS
  - \+ Alt: toggles the visibility of nodes contained within the SS. You can also toggle their visibility by clicking on the pop-eyed icon
- RMB Click: calls context menu of the current SS

### Installation:
Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).\
Add the script "PS_SelectionSets" to a panel.  
