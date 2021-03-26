/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

The helper to load and save data to the Filesystem.

*/


/* TODO:
- 
*/


// = = = = = = = = = = = = = = = = = = = = = = = = = = = 
function getFileNameFromPath(path){
  path = path.split('\\');
  var fileName = path.pop();
  path = path.join('\\');
  return {path:path, fileName:fileName};
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = 



// = = = = = = = = = = = = = = = = = = = = = = = = = = = 
function openFolder( path, selectFile ){
  // Process2
  var _process;
  if(selectFile){
    var fileFolder = getFileNameFromPath(path).path;
    // var command = 'explorer /root,"'+fileFolder+'",select,"'+path+'"';
    var command = 'explorer /root,"'+fileFolder+'"';
  }else{
    var command = 'explorer "'+path+'"';
  }
  _process = new Process2(command);
  var result = _process.launchAndDetach();
  // MessageLog.trace('openFolder >> ('+selectFile+') '+_process.commandLine()+' |||| '+ command );
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = 



// = = = = = = = = = = = = = = = = = = = = = = = = = = = 
function checkDir( path, createDirIfNotExists ){

  //path = fileMapper.toNativePath(path);
  // MessageLog.trace('checkDir: '+path);

  var dir = new Dir;
  if( !dir.fileExists( path ) ){
    if( createDirIfNotExists ) {
      dir.mkdir( path );
      // MessageLog.trace('checkFileDir: Dir created'+path);
      return true;
    }
    // MessageLog.trace('checkFileDir: File dir doesnot exists');
    return false;
  }
  // MessageLog.trace('checkFileDir: File dir exists');
  return true;
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = 



// = = = = = = = = = = = = = = = = = = = = = = = = = = = 
function checkFileDir( path, createDirIfNotExists ){
  path = getFileNameFromPath(path).path;
  // MessageLog.trace('checkFileDir: '+path);
  return checkDir( path, createDirIfNotExists );
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = 





// = = = = = = = = = = = = = = = = = = = = = = = = = = = 
function JSONFile( fileName, filePathConst ){

  //
  this.setFilePath = function(filePathConst){

    if(!filePathConst) return;

    switch(filePathConst){
      case JSONFile.PROJECT_PATH: filePathConst = scene.currentProjectPath(); break;
      case JSONFile.USER_PATH: filePathConst = specialFolders.userScripts; break;
    }
    if( filePathConst.charAt(filePathConst.length-1)=='/' ) filePathConst = filePathConst.substr(0,filePathConst.length-2);
    this.filePath = filePathConst;
  }

  //
  this.checkFileDir = function( createDirIfNotExists ){
    
    if( !this.filePath || !this.fileName ) return false;
    
    // MessageLog.trace('checkFileDir (1): ');

    return checkFileDir( this.getFullPath(true), createDirIfNotExists );
    // MessageLog.trace('checkFileDir (3): '+filePath);
  }

  //
  this.getFullPath = function( originalPath ){
    var fullPath = this.filePath+'/'+this.fileName;
    return originalPath ? fullPath : fileMapper.toNativePath(fullPath);
  }

  //
  this.load = function( defaultData ){ 
    
    // MessageLog.trace('load JSON: '+this.getFullPath() );
    
    if( !this.checkFileDir() ){
      this.data = defaultData;
      return this.data;
    }

    var file = new File( this.getFullPath() );

    try
    {
      if ( file.exists )
      {
        file.open( FileAccess.ReadOnly ) // read only
        var savedData = file.read();
        file.close();
        
        // MessageLog.trace('JSON loaded '+savedData );
        
        this.data = savedData && JSON.parse(savedData);
        if( !this.data && defaultData ) this.data = defaultData;
        
        return this.data;

      }
    }
    catch(err){
      // MessageLog.trace('JSON loading failed');
    }

  };
    
  //
  this.save = function( data )
  {

    // MessageLog.trace("save JSON (1): ");

    this.checkFileDir( true );
    // MessageLog.trace('save JSON (2): ');

    if( data === undefined) data = this.data;

    var jsonData;
    try{
      jsonData = JSON.stringify(data);
    }catch(err){
      // MessageLog.trace('JSON stringify failed');
    }
    data = jsonData || data;

    var file = new File( this.getFullPath() );
    // MessageLog.trace('save JSON (3): '+this.getFullPath()+'.\n'+data);

    try
    { 
      file.open( FileAccess.WriteOnly ); // write only
      file.write( data );
      file.close();
      
      // MessageLog.trace('JSON saved.');
    }
    catch(err){
      // MessageLog.trace('JSON save failed.');
    }
  }

  //
  this.setFilePath( filePathConst );
  this.fileName = fileName;
  this.data = undefined;

}


JSONFile.PROJECT_PATH = 1;
JSONFile.USER_PATH = 2;
// = = = = = = = = = = = = = = = = = = = = = = = = = = = 




//
exports = {
  getFileNameFromPath: getFileNameFromPath,
  openFolder: openFolder,
  JSONFile: JSONFile,
  checkDir: checkDir,
  checkFileDir: checkFileDir
};