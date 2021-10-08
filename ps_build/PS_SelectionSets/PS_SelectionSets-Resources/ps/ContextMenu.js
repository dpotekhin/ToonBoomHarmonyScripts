/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210810
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/ps/Utils.js"));

//
function showContextMenu( menuData, event, parentWidget ){

  // try{ // !!!

  var menu = new QMenu( parentWidget );

  var submenuFlatList = createSubmenu( menu, menuData );

  menu.triggered.connect(function(a){
    // MessageLog.trace('clicked '+JSON.stringify(a,true,'  '));
    var action = submenuFlatList[a.text];
    if( action ) action();
  });
  
  menu.exec( event.globalPos() );

  delete menu;
  
  // }catch(err){MessageLog.trace(err)} // !!!
  
}

//
function createSubmenu( menu, submenuData, submenuFlatList ){

  if( !submenuFlatList ) submenuFlatList = {};

  Object.keys( submenuData ).forEach(function( submenuItemName ){
    
    var submenuItemData = submenuData[submenuItemName];

    // MessageLog.trace('!! '+submenuItemName+' >> '+Utils.isFunction(submenuItemData) );

    if( submenuItemName.charAt(0) === '-' ){ // Add a Separator

      menu.addSeparator();

    }else if( submenuItemName.charAt(0) === '!' ){ // Add a function

      var _submenuItemName = submenuItemName.substr(1,submenuItemName.length);
      // MessageLog.trace('Action: "'+submenuItemName+'" '+_submenuItemName);
      menu.addAction(_submenuItemName);
      submenuFlatList[_submenuItemName] = submenuItemData;

    }else{

      if( typeof submenuItemData === 'string' ){ // Add menu item
        
        menu.addAction(submenuItemName);
        submenuFlatList[submenuItemName] = submenuItemData;

      }else if( Utils.isFunction(submenuItemData) ){ // Dynamic items

        var submenuItems = submenuItemData();

        if( submenuItems ){

          if(  Utils.isFunction(submenuItems) ){ // Add conditional menu item

             // MessageLog.trace('Add Menu item');
            // var submenu = menu.addAction( submenuItems );
            menu.addAction(submenuItemName);
            submenuFlatList[submenuItemName] = submenuItems;

          }else if( Object.keys(submenuItems).length ){ // Add conditional submenu

            var submenuObject = {};
            submenuObject[submenuItemName] = submenuItems;
            createSubmenu( menu, submenuObject, submenuFlatList );

          }

        }else{
          
          // var submenu = menu.addMenu( submenuItemName );
          var submenu = menu.addAction( submenuItemName );
          submenu.enabled = false;

        }

      }else{ // Add a submenu

        var submenu = menu.addMenu( submenuItemName );
        createSubmenu( submenu, submenuItemData, submenuFlatList );

      }

    }

  });

  return submenuFlatList;

}

///
exports = {
  showContextMenu: showContextMenu,
}