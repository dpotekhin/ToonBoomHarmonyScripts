## PS_ResetTransformation
0.210630

### Description
Three scripts to universal (pegs and deformers) reset of transformations, save transformation state and remove that state.

### Usage
### 1) PS_ResetTransformation
Resets transformation of selected Pegs, Drawings and Deformation nodes to their saved (via PS_SaveTransformation script) or default state with options:
- Resets all transformations - Position, Rotation and Scale by default
- Hold the Shift key to reset only the Position of the selected node
- Hold the Control key to reset only the Scale of the selected node
- Hold the Alt key to reset only the Rotation of the selected node

### 2) PS_SaveTransformation
Saves current transformation of selected Pegs, Drawings and Deformation nodes to their custom attributes as the Default state with options:
- Saves all transformations - Position, Rotation and Scale by default
- Hold the Shift key to save only the Position of the selected node
- Hold the Control key to save only the Scale of the selected node
- Hold the Alt key to save only the Rotation of the selected node

### 3) PS_ClearSavedTransformation
Removes custom attributes with the Default state of transformation of selected Pegs, Drawings and Deformation nodes with options:
- Clears all saved transformations - Position, Rotation and Scale by default
- Hold the Shift key to clear only the saved Position of the selected node
- Hold the Control key to clear only the saved Scale of the selected node
- Hold the Alt key to clear only the saved Rotation of the selected node

### Installation:
Copy all files from this folder to Harmony User Scripts directory.