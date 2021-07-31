/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1
*/

function pFile(){

}

//
pFile.getFileNameFromPath = function(path){
  path = path.split('/');
  var fileName = path.pop();
  path = path.join('/');
  return {path:path, fileName:fileName};
}

//
pFile.checkDir = function( path, createDirIfNotExists ){

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

};


//
pFile.checkFileDir = function( path, createDirIfNotExists ){
  path = pFile.getFileNameFromPath(path).path;
  // MessageLog.trace('checkFileDir: '+path);
  return pFile.checkDir( path, createDirIfNotExists );
}

//
pFile.load = function( filePath ){ 
  
  // MessageLog.trace('load JSON: '+this.getFullPath() );
  if( !pFile.checkFileDir(filePath) ){
    return;
  }

  var file = new File( filePath );

  try
  {
    if ( file.exists )
    {
      file.open( FileAccess.ReadOnly ) // read only
      var data = file.read();
      file.close();
      
      // MessageLog.trace('JSON loaded '+data );
      return data;

    }
  }
  catch(err){
    // MessageLog.trace('JSON loading failed');
  }

};

pFile.save = function( path, data ){

  // MessageLog.trace("save (1): "+path);

  pFile.checkFileDir( path, true );
  // MessageLog.trace('save (2)');

  var file = new File( path );  

  try
  { 
    file.open( FileAccess.WriteOnly ); // write only
    file.write( data );
    file.close();
    
    // MessageLog.trace('Saved.');
  }
  catch(err){
    // MessageLog.trace('Save failed: '+err);
  }
}

//
pFile.loadJSON = function( path, defaultData ){
  var data = pFile.load( path );
  if( !data ) return defaultData;
  return JSON.parse(data);
}

//
pFile.saveJSON = function( path, data ){
  // MessageLog.trace('saveJSON: '+path+'\n'+JSON.stringify(data));
  var jsonData;
  try{
    jsonData = typeof data !== 'string' ? JSON.stringify(data) : data;
  }catch(err){
    // MessageLog.trace('JSON stringify failed: '+ err);
  }
  data = jsonData || data;
  pFile.save( path, data );
  // MessageLog.trace('saveJSON COMPLETE');
}

//
pFile.checkPath = function( path, relativePath ){
  try{ 
    if( path.charAt(0)==='~') return scene.currentProjectPath() + path.substr(1,path.length);
    else if( path.charAt(0)==='.') return ( relativePath || specialFolders.userScripts) + path.substr(1,path.length);
    return path;
  }catch(err){
    // MessageLog.trace('checkPath failed: '+ err);
  }
}


///
exports = pFile;