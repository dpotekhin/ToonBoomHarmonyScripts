/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/Utils.js"));

//
function showContextMenu( menuData, event, parentWidget ) {

    // try{ // !!!

    var menu = new QMenu( parentWidget || getParentWidget() );

    var submenuFlatList = createSubmenu(menu, menuData);

    menu.triggered.connect(function(a) {
        // MessageLog.trace('clicked '+JSON.stringify(a,true,'  ')+'\n'+JSON.stringify( submenuFlatList,true,'  '));
        var action = submenuFlatList[a.text];
        if (action) action();
    });

    menu.exec( event && event.globalPos ? event.globalPos() : ( event || new QPoint( QCursor.pos().x(), QCursor.pos().y() ) ) );

    delete menu;

    // }catch(err){MessageLog.trace(err)} // !!!

}


//
function addMenuAction(menu, itemName) {
    // 
    var iconSeparatorIndex = itemName.indexOf('$');
    if (iconSeparatorIndex !== -1) {
        var iconPath = itemName.substr(iconSeparatorIndex + 1, itemName.length);
        itemName = itemName.substr(0, iconSeparatorIndex);
        // MessageLog.trace('ICON: "'+itemName+'", "'+iconPath+'"');
        var menuItem = menu.addAction(new QIcon(iconPath), itemName);
        menuItem.itemName = itemName;
        return menuItem;
    }

    var menuItem = menu.addAction(itemName);
    menuItem.itemName = itemName;
    return menuItem;

}


//
function createSubmenu(menu, submenuData, submenuFlatList) {

    if (!submenuFlatList) submenuFlatList = {};

    Object.keys(submenuData).forEach(function(submenuItemName) {

        var submenuItemData = submenuData[submenuItemName];

        // MessageLog.trace('!! '+submenuItemName+' >> '+Utils.isFunction(submenuItemData) );

        if (submenuItemName.charAt(0) === '-') { // Add a Separator

            menu.addSeparator();

        } else if (submenuItemName.charAt(0) === '!') { // Add a function

            var _submenuItemName = submenuItemName.substr(1, submenuItemName.length);
            // MessageLog.trace('Action: "'+submenuItemName+'" '+_submenuItemName);
            // menu.addAction(_submenuItemName);
            _submenuItemName = addMenuAction(menu, _submenuItemName).itemName;
            submenuFlatList[_submenuItemName] = submenuItemData;

        } else {

            if (typeof submenuItemData === 'string') { // Add menu item

                // menu.addAction(submenuItemName);
                submenuItemData = addMenuAction(menu, submenuItemName).itemName;
                submenuFlatList[submenuItemName] = submenuItemData;

            } else if (Utils.isFunction(submenuItemData)) { // Dynamic items

                var submenuItems = submenuItemData();

                if (submenuItems) {

                    if (Utils.isFunction(submenuItems)) { // Add conditional menu item

                        // MessageLog.trace('Add Menu item');
                        // var submenu = menu.addAction( submenuItems );
                        // menu.addAction(submenuItemName);
                        submenuItemName = addMenuAction(menu, submenuItemName).itemName;
                        submenuFlatList[submenuItemName] = submenuItems;

                    } else if (Object.keys(submenuItems).length) { // Add conditional submenu

                        var submenuObject = {};
                        submenuObject[submenuItemName] = submenuItems;
                        createSubmenu(menu, submenuObject, submenuFlatList);

                    }

                } else {

                    // var submenu = menu.addMenu( submenuItemName );
                    // var submenu = menu.addAction( submenuItemName );
                    var submenu = addMenuAction(menu, submenuItemName);
                    submenu.enabled = false;

                }

            } else { // Add a submenu

                var submenu = menu.addMenu(submenuItemName);
                createSubmenu(submenu, submenuItemData, submenuFlatList);

            }

        }

    });

    return submenuFlatList;

}


function getParentWidget() {

    var topWidgets = QApplication.topLevelWidgets();

    for (var i in topWidgets) {
        var widget = topWidgets[i];
        if (widget instanceof QMainWindow && !widget.parentWidget())
            return widget;
    }

    return "";

}

///
exports = {
    showContextMenu: showContextMenu,
}