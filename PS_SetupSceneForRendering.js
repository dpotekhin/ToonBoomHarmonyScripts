/*
Author: D.Potekhin (d@peppers-studio.ru)

Version: 0.211007

Description: 
This script lets you to set up all the Write nodes of a scene for frame sequences rendering.

After running the script, all nodes named "Write-Main" (general output) and "Write_*" (standard nodes) will be disabled.

The rest of the nodes named by the "Write_<COMP_NAME>" or "<COMP_NAME>_Write" pattern will have the following settings:
- Output: Output Drawings
- Format: PNG4
- File name: "frames/<COMP_NAME>/<SCENE_NAME>-<COMP_NAME>-", where SCENE_NAME is formed from the closest fragment of the path of the scene matching this pattern "*_sq###_sh####". For example, for a scene with the path "D:\project\ep006\ep006_sq001\ep006_sq001_sh1340\anim2d\harmony\sceneFolder" and the name of the composition "Char1", the following file name will be generated: "frames/CharA/ep006_sh1340-CharA-".
If the scene name pattern is not found in the path, then the file name will be like this: "frames/CharA/CharA-".

Scene resolution is exposed: 3840x2160

If you run the script with Composite nodes selected it automaticaly creates Write nodes to that Composites if them not exists.
If a Write node is linked to a Composite the script fixes its name.

If you run the script with Write nodes selected their names will be fixed.

Script output can be found in Message Log panel (Windows / Message Log)

ToDo:
- Ability to change the default resolution
*/


function PS_SetupSceneForRendering(){
	
	MessageLog.clearLog();

	var framePrefix = '';

	if( !KeyModifiers.IsShiftPressed() ){

		var scenePath = scene.currentProjectPath().split('/');
		MessageLog.trace('scenePath: '+scenePath);

		var scName;
		var scNameLoc;
		do{
			var _name = scenePath.pop();
			if( !scNameLoc ) scNameLoc = _name;
			// MessageLog.trace('_name: '+_name+', '+scenePath.length);
			if( _name.match(/_sq\d\d\d_sh\d\d\d\d/i) ) scName = _name;
		}while( scenePath.length && !scName );

		if( !scName ){
			MessageLog.trace('!!! Scene Name Folder with "*_sq###_sh####" pattern not Found.');
			var scNameLocParsed = scNameLoc.match(/_(sh\d\d\d\d)/i);
			// MessageLog.trace('scNameLoc: '+ scNameLoc+', '+scNameLocParsed);
			if( scNameLocParsed ){
				framePrefix = scNameLocParsed[1]+'-';
				MessageLog.trace('!!! Only Scene number found in the Scene name: ' + framePrefix );
			}
			// return;
		}else{
			scName = scName.split('_');
			framePrefix = scName[0]+'_'+scName[2]+'-';
		}
	}

	if( !KeyModifiers.IsControlPressed() ){
		
		framePrefix = Input.getText('Enter Scene prefix:', framePrefix, '');

	}

	MessageLog.trace('framePrefix: "'+ framePrefix +'"');

	scene.beginUndoRedoAccum('Setup the Scene For Rendering');
	// Check or create Write nodes is there's selection

	try{
	selection.selectedNodes().forEach(function(_node,i){
		
		MessageLog.trace( i+') '+_node+' > '+node.type(_node) );

		var parentNodeName = node.getName(_node);
		var writeNode = node.type(_node) === 'WRITE' ? _node : undefined;

		if( ['COMPOSITE','READ','GROUP'].indexOf(node.type(_node)) !== -1 ){ // Get connected Write node

			var numOutput = node.numberOfOutputPorts( _node );
  			for(var ii=0; ii<numOutput; ii++){
			    var childNode = node.dstNode(_node, ii, 0);
			    if( node.type(childNode) === 'WRITE' ) writeNode = childNode; break;
			}
			
			if( !writeNode ){ // create a Write node and link it to the Composite 

				MessageLog.trace('Create Write node: '+parentNodeName );
				var x = ~~( node.coordX(_node) + node.width(_node) / 4 );
				var y = ~~( node.coordY(_node) + node.height(_node) * 3 );
				writeNode = node.add( node.parentNode(_node), ''+parentNodeName, 'WRITE', x, y, 0 );
				node.link( _node, 0, writeNode, 0 );

			}

		}

		if( !writeNode ) return;

		node.setColor( writeNode, new ColorRGBA(255, 0 , 0, 255) )

		var fixedWriteNodeName = node.getName( writeNode );

		if( fixedWriteNodeName.indexOf('Write-') === -1 ){
			fixedWriteNodeName = fixedWriteNodeName.replace(/[-_]?write?[-_]?/gi,'');
		}

		fixedWriteNodeName = fixedWriteNodeName
			.replace(/^Write-/,'')
			.replace(/_\d$/,'')
			.replace(/[-_]?composite[-_]?/gi,'')
			.replace(/-.?cmp$|_.?cmp$/gi,'')
			.replace(/-.?com$|_.?com$/gi,'')
			.replace(/-rig$|_rig$/gi,'')
		;
		
		if( !fixedWriteNodeName ) fixedWriteNodeName = 'NAME-IS-NOT-DEFINED';

		fixedWriteNodeName = 'Write-'+fixedWriteNodeName;

		if( fixedWriteNodeName !== node.getName( writeNode ) ){
			
			MessageLog.trace('Rename Write node '+node.getName( writeNode )+' >> '+fixedWriteNodeName );
			if( !node.rename( writeNode, fixedWriteNodeName ) ) node.rename( writeNode, fixedWriteNodeName+'_1' );

		}

		MessageLog.trace(' >> '+ writeNode );

	});
	
	}catch(err){MessageLog.trace('Error: '+err)}
	


	// Configure Write Nodes
	node.getNodes(['WRITE']).forEach(function(n,i){
		var nn = node.getName(n);
		MessageLog.trace((i+1)+') "'+nn+'", "'+n+'"');
		if( nn==='Write-Main' || nn.indexOf('Write_') !== -1 ) {
			node.setEnable(n,false);
			MessageLog.trace('-- Disabled');
			return;
		}
		var ncn = nn.replace('Write-','').replace(/_Write|-Write/i,''); // Remove all "write" entries from the sequence name
		node.setEnable(n,true);
		node.setTextAttr(n,'EXPORT_TO_MOVIE',1,'Output Drawings');
		node.setTextAttr(n,'DRAWING_TYPE',1,'PNG4');
		var frameName = 'frames/'+ncn+'/'+framePrefix+ncn+'-';
		node.setTextAttr(n,'DRAWING_NAME',1,frameName);
		MessageLog.trace('++ Enabled');
		MessageLog.trace('++ Frame name: "'+frameName+'"');
	});




	// // Scene settings
	scene.setDefaultResolution( 3840, 2160, 41.112 );
	MessageLog.trace('Scene Resolution: '+scene.defaultResolutionX()+' x '+scene.defaultResolutionY() );

	scene.endUndoRedoAccum();

}

/*
// Minified version to use in the command line render

node.getNodes(['WRITE']).forEach(function(n){var nn=node.getName(n);if(nn==='Write-Main' || nn==='Write') {node.setEnable(n,false);return;}var ncn=nn.replace('Write-','');node.setEnable(n,true);node.setTextAttr(n,'EXPORT_TO_MOVIE',1,'Output Drawings');node.setTextAttr(n,'DRAWING_TYPE',1,'PNG4');node.setTextAttr(n,'DRAWING_NAME',1,'frames/'+ncn+'/'+ncn);});

*/