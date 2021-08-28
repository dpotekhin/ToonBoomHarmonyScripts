/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_SetSceneDurationToSoundLength :]
[Version: 0.210821 :]

[Description:
This script quickly sets the Scene duration to the selected Sound layer duration.
:]

[Usage:
* Select a Sound layer and click the script button.
:]

TODO:
- 
*/

function PS_SetSceneDurationToSoundLength(){
    
    MessageLog.clearLog();

    var columnName;

    if ( Timeline.selIsColumn(0) ) {

        columnName = Timeline.layerToColumn(0);
        if( column.type(columnName) !== 'SOUND' ) columnName = undefined;
    }

    if( !columnName ){
        MessageBox.warning('Please select a Sound layer',0,0,0,'Error');
        return;
    }

    var soundColumn = column.soundColumn( columnName );
    
    var sequence = soundColumn.sequences()[0];
    if( !sequence ) return;
    // MessageLog.trace( Object.getOwnPropertyNames( sequence ).join('\n')   );

    var soundLengthInFrames = sequence.stopFrame;
    var durationDiff = soundLengthInFrames - frame.numberOf();

    MessageLog.trace( 'Sound Length In Frames:' + soundLengthInFrames+' ('+durationDiff+')'  );
    
    if ( durationDiff > 0 ) {
        frame.insert(frame.numberOf(), durationDiff );
    }else if ( durationDiff < 0 ) {
        frame.remove(frame.numberOf(), -durationDiff );
    }

}