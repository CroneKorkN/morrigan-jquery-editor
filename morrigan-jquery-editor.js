$.widget( "morrigan.morrigan_editor", {

    options: {
        height: '300px',
        width: '700px',
        prefix: 'mrge',
        doctype: '<!DOCTYPE html>',
        iframeStyles: 'assets/morrigan_editor/iframe.css',
        toolbox: [
            [
                ['bold', 'italy']
            ],
            [
                ['strike']
            ]
        ]
    },

    actions: [
        {
            name: 'bold',
            view: {
                icon: 'black',
                title: 'Bold'
            },
            onClickHandler: function (self) {
                console.log(self.options.height)
            }
        },
        {
            name: 'italy',
            view: {
                icon: 'red',
                title: 'Italy'
            },
            onClickHandler: function (self) {
                console.log('Italy' + self.options.height)
            }
        },
        {
            name: 'strike',
            view: {
                icon: 'gray',
                title: 'Strike'
            },
            onClickHandler: function (self) {
                console.log('Strike' + self.options.height)
            }
        }

    ],
 
    _create: function() {
        this._setupMainElement();

        var toolbox = this._formToolbox();
        this.element.append(toolbox);
        var content = this._formContentField();
        this.element.append(content);
        this._setupIframe();

        this._setupContentEditableDefaultBehavior();
        this._bindEvents();
    },

    // Setup main element

    _setupMainElement: function () {
        this.element.width(this.options.width).height(this.options.height).addClass('morrigan-editor');
    },

    // Bind events

    _bindEvents: function () {
        var self = this;
        $(this.options.toolbox).each(function () {
            $(this).each(function () {
                $(this).each(function () {
                    self._bindEventToAction(this);
                });
            });
        });
    },

    _bindEventToAction: function (action_name) {
        var self = this;
        var config = this._getActionConfig(action_name);
        var id = this._generateActionId(action_name);
        $('#' + id).on("click", function () {
            config.onClickHandler(self);
        });
    },

    _generateActionId: function (action_name) {
        return this.options.prefix + '_' + action_name;
    },

    // Form toolbox

    _formToolbox: function() {
        var self = this;
        var toolbox_lines = "";
        $(this.options.toolbox).each(function () {
            toolbox_lines += self._formToolboxLine(this);
        });
        toolbox_lines += "<div class='clear'></div>";
        return "<div class='mrge-toolbox'>" + toolbox_lines + "</span>"
    },

    _formToolboxLine: function(arr) {
        var self = this;
        var toolbox_lines = "";
        $(arr).each(function () {
            toolbox_lines += self._formToolboxBlock(this);
        });
        return "<ul>" + toolbox_lines + "</ul>";
    },

    _formToolboxBlock: function (arr) {
        var self = this;
        var block_items = "";
        $(arr).each(function () {
            block_items += self._formToolboxItem(this);
        });
        return "<li>" + block_items + "</li>";
    },

    _formToolboxItem: function (name) {
        var config = this._getActionConfig(name);
        var result = "<a title='" + config['view']['title'] + "'";
        result += " id='" + this.options.prefix + '_' + config.name + "'";
        if (config.view.icon) {
            result += " style='background: " + config['view']['icon'] + "'";
        }
        result += ">";
        if (config.view.text) {
            result += config['view']['text'];
        }
        return result + "</a>";
    },

    // Form content field

    _formContentField: function () {
        var content_height = this._calcContentFieldHeight();
        return $("<div class='mrge-content' style='height: " + content_height + "px'><iframe frameborder='0'></iframe></div>");
    },

    _calcContentFieldHeight: function () {
        var toolbox_height = this.element.find('.mrge-toolbox').outerHeight(true);
        return this.element.height() - toolbox_height;
    },

    _setupIframe: function () {
        var iframe = this.element.find('iframe');
        var idoc = iframe.get(0).contentWindow.document;
        idoc.open();
        idoc.write(this.options.doctype);
        idoc.write("<html style='cursor: text;height: 100%;'>");
        idoc.write("<head><link href='" + this.options.iframeStyles + "' media='all' rel='stylesheet' type='text/css'></head>");
        idoc.write("<body contenteditable='true' class='mrge-iframe-body'><div>asdasdasdas<br>asdasd</div> <div>ssssss</div> <div>ssssss</div></body></html>");
        idoc.close();
        iframe.contents().find('body').height(this._calcOperaIframeBodyHeight(iframe));
    },

    _calcOperaIframeBodyHeight: function (iframe) {
        var body = iframe.contents().find('body');
        var diff = body.outerHeight(true) - body.height();
        return iframe.height() - diff
    },

    // Content field custom behavior

    _setupContentEditableDefaultBehavior: function () {
        var self = this;
        this.element.find('iframe').contents().find('body').on('keypress', function (e) {
            if (e.keyCode==13) {
                e.preventDefault();
                self._enterHandler();
            }

        });
    },

    _enterHandler: function () {
        var selection = this._selectionGet();
        console.log(this._selectionIsEndOfElement(selection));
    },

    // Support

    _getActionConfig: function (name) {
        return $.grep(this.actions, function (action) {
            return action["name"] == name;
        })[0];
    },

    // Selection

    _selectionGet : function () {
        if (this.element.find('iframe').get(0).contentWindow.getSelection) {
            console.log(1);
            return this.element.find('iframe').get(0).contentWindow.getSelection()

        } else {
            console.log(2);
            return this.element.find('iframe').get(0).contentWindow.document.selection.createRange();
        }
    },

    _selectionIsEndOfElement : function (selection) {
        if (this._selectionIsOldIERange(selection)) return this._selectionIsEndOfElementOldIE(selection);
        return this._selectionIsEndOfElementNew(selection);
    },

    _selectionIsEndOfElementNew : function (selection) {
        return !(selection.anchorNode.nextSibling) &&
            selection.anchorOffset == selection.focusOffset &&
            selection.anchorOffset == selection.anchorNode.nodeValue.length;
    },

    _selectionIsEndOfElementOldIE: function (range) {
        var parentElement = range.parentElement();
        var preCaretTextRange = this.element.find('iframe').get(0).contentWindow.document.body.createTextRange();
        preCaretTextRange.moveToElementText(parentElement);
        preCaretTextRange.setEndPoint("EndToEnd", range);
        return preCaretTextRange.text == parentElement.innerText;
    },

    _selectionIsOldIERange: function (selection) {
        return selection.offsetLeft != undefined;
    }

 
});