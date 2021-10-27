/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_SetSceneDurationToSoundLength :]
[Version: 0.210918 :]

[Description:
This script quickly sets the duration of the Scene to the duration of a Sound layer.
:]

[Usage:
Select a Sound layer and click the script button.
The first Sound layer will be used as duration source if no layers are selected.
:]

TODO:
- 
*/

function PS_SetSceneDurationToSoundLength(){
    
    // MessageLog.clearLog();

    var columnName;

    // MessageLog.trace('PS_SetSceneDurationToSoundLength: numLayerSel: '+Timeline.numLayerSel+', numLayers: '+Timeline.numLayers ); // numLayers ()

    if( !Timeline.numLayerSel ){

        columnName = getSoundColumn();
        if( columnName ) MessageLog.trace('No layer selected. Used the first Sound layer "'+columnName+'"');

    }else{

        columnName = Timeline.selToColumn(0);
        if( column.type(columnName) !== 'SOUND' ) columnName = undefined;

    }

    if( !columnName ){
        MessageBox.warning('Please select a Sound layer',0,0,0,'Error');
        return;
    }

    var soundColumn = column.soundColumn( columnName );
    MessageLog.trace( 'Sound Layer: "'+columnName+'"');

    var maxFrame = 0;

    var sequences = soundColumn.sequences();
    sequences.forEach(function(sequence,i){
        MessageLog.trace('Sequence '+i+' > '+sequence.startFrame+'('+sequence.startTime+') - '+sequence.stopFrame+' ('+sequence.stopTime+')' );
        if( maxFrame < sequence.stopFrame ) maxFrame = sequence.stopFrame;
        // MessageLog.trace('>> '+Object.getOwnPropertyNames( sequence ).join('\n'));    
    });
    
    var durationDiff = (maxFrame) - frame.numberOf();

    MessageLog.trace( 'Sound Length In Frames:' + maxFrame+' ('+durationDiff+')'  );
    
    scene.beginUndoRedoAccum('Set Scene Duration To Sound Length');

    if ( durationDiff > 0 ) {
        frame.insert(frame.numberOf(), durationDiff );
    }else if ( durationDiff < 0 ) {
        frame.remove(frame.numberOf(), -durationDiff );
    }

    scene.endUndoRedoAccum();


    ///
    function getSoundColumn(){

        for( var i = 0; i < Timeline.numLayers; i++ ){

            if ( Timeline.layerIsColumn(i) ){
                var _columnName = Timeline.layerToColumn(i);
                if( column.type(_columnName) === 'SOUND' ) return _columnName;
            }

        }

    }

}