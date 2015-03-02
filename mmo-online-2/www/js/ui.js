/**
 * Created by Kevin on 10/02/2015.
 */
var UI = {
    div: null,
    buttonSelected:null,
    buttonClicked:false,
    leftMouseDown:null,
    rightMouseDown:null,
    leftMouseDragging:false,
    rightMouseDragging:false,
    mousePosition: new LinAlg.Vector2(0,0),
    cameraPosition: new LinAlg.Vector2(0,0),
    cameraScaleY: 0.5,
    idNum:0,

    //defaults, to be overwritten when needed
    onLeftMouseClick: function(v) {
        console.log('Left click ' + JSON.stringify(v.scaled(0.1)));
    },
    onLeftMouseDrag: function(v1, v2) {
        console.log('Left drag ' + JSON.stringify(v1.scaled(0.1)) + ' to ' + JSON.stringify(v2.scaled(0.1)));
    },
    onRightMouseClick: function(v) {
        console.log('Right click ' + JSON.stringify(v.scaled(0.1)));
    },
    onRightMouseDrag: function(v1, v2) {
        console.log('Right drag ' + JSON.stringify(v1.scaled(0.1)) + ' to ' + JSON.stringify(v2.scaled(0.1)));
    },
    onAction: function(v, a) {
        console.log(JSON.stringify(a) + ' at ' + JSON.stringify(v.scaled(0.1)));
    },

    //button events, don't override
    onActionButtonMouseOver: function(b) {
        UI.setCursor('pointer');
        b.updateStyle(true, false);
    },
    onActionButtonMouseDown: function(b) {
        if (UI.buttonSelected != null) {
            UI.cancelMouseAction();
            UI.buttonClicked = false;
            UI.onActionButtonMouseOver(b);
        }
        b.updateStyle(true, true);
        UI.buttonClicked = true;
    },
    onActionButtonMouseOut: function(b) {
        if (UI.buttonClicked) {
            UI.buttonClicked = false;
            UI.setCursor('auto');
        } else {
            if (UI.buttonSelected != null) {
                //set cursor to action's cursor
                UI.setCursor(UI.buttonSelected.action.cursor);
            } else {
                UI.setCursor('auto');
            }
        }
        b.updateStyle(false, false);
    },
    onActionButtonMouseUp: function(b) {
        if (!UI.buttonClicked) {
            //not meaningful
            return;
        }
        UI.buttonClicked = false;
        UI.buttonSelected = b;
        b.updateStyle(true, false);
        //set cursor to action's cursor
        UI.setCursor(UI.buttonSelected.action.cursor);
    },
    cancelMouseAction: function () {
        if (UI.buttonSelected == null) {
            return;
        }
        UI.setCursor('auto');
        var b = UI.buttonSelected;
        UI.buttonSelected = null;
        b.updateStyle(false, false);
    },


    mouseDragDistance:10,

    init:function() {
        var _this = this;
        this.div = document.getElementById('gameDiv');
        this.div.oncontextmenu = function () {return false;};
        this.div.onclick = function(e) {e.preventDefault(); e.defaultPrevented = true; e.stopPropagation(); return false;};
        this.div.onselectstart = function() {return false;};

        this.div.onmousedown = function(e) {
            UI.fixMouseButton(e);
            if (UI.buttonPressed) {
                return;
            }
            if (e.which == 1) {
                UI.leftMouseDown = new LinAlg.Vector2(e.clientX, e.clientY);
                UI.leftMouseDragging = false;
            } else if (e.which == 3) {
                UI.rightMouseDown = new LinAlg.Vector2(e.clientX, e.clientY);
                UI.rightMouseDragging = false;
            }
            return false;
        };

        this.div.onmouseup = function(e) {
            if (UI.buttonPressed) {
                UI.buttonPressed = false;
                return;
            }
            if (e.which == 1) {
                if (UI.leftMouseDragging) {
                    UI.onLeftMouseDrag(UI.leftMouseDown, UI.mousePosition.copy());
                } else {
                    if (UI.buttonSelected != null) {
                        UI.onAction(UI.mousePosition.copy(), UI.buttonSelected.action);
                        UI.cancelMouseAction();
                    } else if (UI.leftMouseDown != null) {
                        UI.onLeftMouseClick(UI.leftMouseDown);
                    }
                }
                UI.leftMouseDown = null;
                UI.leftMouseDragging = false;
            } else if (e.which == 3) {
                UI.cancelMouseAction();
                if (UI.rightMouseDragging) {
                    UI.onRightMouseDrag(UI.rightMouseDown, UI.mousePosition.copy());
                } else if (UI.rightMouseDown != null) {
                    UI.onRightMouseClick(UI.rightMouseDown);
                }
                UI.rightMouseDown = null;
                UI.rightMouseDragging = false;
            }
            return false;
        };

        this.div.onmousemove = function(e) {
            UI.mousePosition.x = e.clientX;
            UI.mousePosition.y = e.clientY;
            if (UI.leftMouseDown != null) {
                if (UI.leftMouseDown.distanceTo(UI.mousePosition) >= UI.mouseDragDistance) {
                    UI.leftMouseDragging = true;
                    UI.cancelMouseAction();
                }
            }
            if (UI.rightMouseDown != null) {
                if (UI.rightMouseDown.distanceTo(UI.mousePosition) >= UI.mouseDragDistance) {
                    UI.rightMouseDragging = true;
                    UI.cancelMouseAction();
                }
            }
            return false;
        };

        this.div.onmouseout = function(e) {
            UI.div.onmouseup(e);
        };
    }
};

UI.addElement = function(element) {
    this.div.appendChild(element.div);
};

UI.Pane = function(x,y) {
    x = x|0;
    y = y|0;

    this.x = x;
    this.y = y;
    this.div = document.createElement('div');
    this.div.className = 'UIPane';
    this.div.style.left = x.toString()+'px';
    this.div.style.top = y.toString()+'px';

    this.hiliteDiv = document.createElement('div');
    this.hiliteDiv.className = 'UILayerDiv';
    this.hiliteDiv.style.zIndex = '0';
    this.hiliteDiv.style.backgroundColor = 'black';
    this.hiliteDiv.style.opacity = 0.5;

    this.div.appendChild(this.hiliteDiv);

    this.addElement = function(element) {
        this.div.appendChild(element.div);
    };
};

UI.ActionButton = function(imgSrc, w, h, action) {
    var _this = this;
    this.id = UI.idNum++;
    this.action = action;
    this.w = w;
    this.h = h;


    this.div = document.createElement('div');
    this.div.className = 'UIWrapperDiv';

    this.img = new Image();
    this.img.src = imgSrc;
    this.img.setAttribute('position', 'absolute');
    this.img.style.width = (this.w).toString() + 'px';
    this.img.style.height = (this.h).toString() + 'px';
    this.img.style.zIndex = '1';

    this.hiliteDiv = document.createElement('div');
    this.hiliteDiv.className = 'UILayerDiv';
    this.hiliteDiv.style.zIndex = '2';

    this.borderDiv = document.createElement('div');
    this.borderDiv.className = 'UILayerDiv';
    this.borderDiv.style.zIndex = '3';

    this.onClick = function() {};

    this.div.onmouseover = function(e) {
        if (UI.leftMouseDown == null) {
            UI.onActionButtonMouseOver(_this);
        }
    };
    this.div.onmouseout = function(e) {
        if (UI.leftMouseDown == null) {
            UI.onActionButtonMouseOut(_this);
        }
    };
    this.div.onmousedown = function(e) {
        if (UI.leftMouseDown == null) {
            UI.onActionButtonMouseDown(_this);
            e.preventDefault(); e.defaultPrevented = true; e.stopPropagation(); return false;
        }
    };
    this.div.onmouseup = function(e) {
        if (UI.leftMouseDown == null) {
            UI.onActionButtonMouseUp(_this);
            e.preventDefault(); e.defaultPrevented = true; e.stopPropagation(); return false;
        }
    };

    this.updateStyle = function(mouseIn, mouseDown) {
        var active = false;
        if (UI.buttonSelected != null && UI.buttonSelected.id == this.id) {
            active = true;
        }

        if (mouseDown || active) {
            this.borderDiv.style.borderStyle = 'inset';
        } else {
            this.borderDiv.style.borderStyle = 'outset';
        }

        if (active) {
            this.setHighlight('green', 0.5);
        } else if (mouseIn) {
            this.setHighlight('white', 0.5);
        } else {
            this.setHighlight('white', 0);
        }
    };

    this.setHighlight = function(color, opacity) {
        this.hiliteDiv.style.backgroundColor = color;
        this.hiliteDiv.style.opacity = opacity;
    };

    this.setBorder = function(color, style, width) {
        this.borderDiv.style.borderColor = color;
        this.borderDiv.style.borderStyle = style;
        this.borderDiv.style.borderWidth = width;
    };

    this.setBorder('white', 'outset', 2);
    this.setHighlight('white', 0);
    this.div.appendChild(this.img);
    this.div.appendChild(this.hiliteDiv);
    this.div.appendChild(this.borderDiv);
};

UI.ActionBar = function (x, y, rows, cols) {
    this.slots = [];
    this.div = document.createElement('div');
    this.div.className = 'UIWrapperDiv';
    this.table = document.createElement('table');

    for (var i = 0; i < rows; i++) {
        this.slots[i] = [];
        var row = document.createElement('tr');
        for (var j = 0; j < cols; j++) {
            var col = document.createElement('td');
            col.style.background = 'black';
            col.style.border = '1px solid grey';
            col.style.width = '50px';
            col.style.height = '50px';
            row.appendChild(col);
            this.slots[i][j] = {td:col};
        }
        this.table.appendChild(row);
    }
    this.div.appendChild(this.table);

    this.addElement = function(element, row, col) {
        this.slots[row][col].button = element;
        this.slots[row][col].td.appendChild(element.div);
    };
};

UI.setCursor = function(cursor) {
    this.div.style.cursor = cursor;
};

UI.fixMouseButton = function(e) {
    if (!e.which && e.button) {
        if (e.button & 1) e.which = 1;      // Left
        else if (e.button & 4) e.which = 2; // Middle
        else if (e.button & 2) e.which = 3; // Right
    }
};

UI.viewToWorld = function(v) {
    var v2 = v.copy();
    v2.y *= 2;
    v2.x -= UI.cameraPosition.x;
    v2.y -= UI.cameraPosition.y;
    return v2;
};

UI.worldToView = function(v) {
    var v2 = v.copy();
    v2.x += UI.cameraPosition.x;
    v2.y += UI.cameraPosition.y;
    v2.y /= 2;
    return v2;
};