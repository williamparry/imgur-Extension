var chrome = {

    // ------------------------------------------------------------------
    // Browser Action
    // http://developer.chrome.com/extensions/browserAction.html
    // ------------------------------------------------------------------

    browserAction: {

        // ------------------------------------------------------------------
        // Methods
        // ------------------------------------------------------------------

        enable: function (tabId) {
            /// <summary>Enables the browser action for a tab. By default, browser actions are enabled.</summary>
            /// <param name="tabId" type="Number" integer="true" optional="true">The id of the tab for which you want to modify the browser action.</param>
        },

        setBadgeBackgroundColor: function (details) {
            /// <summary>Sets the background color for the badge.</summary>
            /// <param name="details" type="Object">
            /// (ColorArray || string) color<br />
            /// - An array of four integers in the range [0,255] that make up the RGBA color of the badge.<br />
            /// [(integer) tabId]<br />
            /// - Limits the change to when a particular tab is selected. Automatically resets when the tab is closed. 
            /// </param>
        },

        setBadgeText: function (details) {
            /// <summary>Sets the badge text for the browser action. The badge is displayed on top of the icon.</summary>
            /// <param name="details" type="Object">
            /// (string) text<br />
            /// - Any number of characters can be passed, but only about four can fit in the space.<br />
            /// [(integer) tabId]<br />
            /// - Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
            /// </param>
        },

        setTitle: function (details) {
            /// <summary>Sets the title of the browser action. This shows up in the tooltip.</summary>
            /// <param name="details" type="Object">
            /// (string) title<br />
            /// - The string the browser action should display when moused over.<br />
            /// [(integer) tabId]<br />
            /// - Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
            /// </param>
        },

        getBadgeText: function (details, callback) {
            /// <summary>Gets the badge text of the browser action. If no tab is specified, the non-tab-specific badge text is returned.</summary>
            /// <param name="details" type="Object">
            /// [(integer) tabId]<br />
            /// - Specify the tab to get the badge text from. If no tab is specified, the non-tab-specific badge text is returned.
            /// </param>
            /// <param name="callback" type="Function">
            /// The callback parameter should specify a function that looks like this:<br />
            /// - function((string) result) {...};
            /// </param>
        },

        setPopup: function (details) {
            /// <summary>Sets the html document to be opened as a popup when the user clicks on the browser action's icon.</summary>
            /// <param name="details" type="Object">
            /// [(string) popup]<br />
            /// - The html file to show in a popup. If set to the empty string (''), no popup is shown.<br />
            /// [(integer) tabId]<br />
            /// - Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
            /// </param>
        },

        disable: function (tabId) {
            /// <summary>Disables the browser action for a tab.</summary>
            /// <param name="tabId" type="Number" integer="true">
            /// [(integer) tabId]<br />
            /// - The id of the tab for which you want to modify the browser action.
            /// </param>
        },

        getTitle: function (details, callback) {
            /// <summary>Gets the title of the browser action.</summary>
            /// <param name="details" type="Object">
            /// [(integer) tabId]<br />
            /// - Specify the tab to get the title from. If no tab is specified, the non-tab-specific title is returned.
            /// </param>
            /// <param name="callback" type="Function">
            /// The callback parameter should specify a function that looks like this:<br />
            /// - function((string) result) {...};
            /// </param>
        },

        getBadgeBackgroundColor: function (details, callback) {
            /// <summary>Gets the background color of the browser action.</summary>
            /// <param name="details" type="Object">
            /// [(integer) tabId]<br />
            /// - Specify the tab to get the badge background color from. If no tab is specified, the non-tab-specific badge background color is returned.
            /// </param>
            /// <param name="callback" type="Function">
            /// The callback parameter should specify a function that looks like this:<br />
            /// - function((ColorArray) result) {...};
            /// </param>
        },

        getPopup: function (details, callback) {
            /// <summary>Gets the title of the browser action.</summary>
            /// <param name="details" type="Object">
            /// [(integer) tabId]<br />
            /// - Specify the tab to get the popup from. If no tab is specified, the non-tab-specific popup is returned.
            /// </param>
            /// <param name="callback" type="Function">
            /// The callback parameter should specify a function that looks like this:<br />
            /// - function((string) result) {...};
            /// </param>
        },

        setIcon: function(details, callback) {
            /// <summary>
            /// Sets the icon for the browser action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element.<br />
            /// Either the "path" or the "imageData" property must be specified. 
            /// </summary>
            /// <param name="details" type="Object">
            /// [(string) path]<br />
            /// - Relative path to an image in the extension to show in the browser action.<br />
            /// [(integer) tabId]<br />
            /// - Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.<br />
            /// [(imagedata) imageData]<br />
            /// - Pixel data for an image. Must be an ImageData object (for example, from a canvas element).<br />
            /// </param>
            /// <param name="callback" type="Function">
            /// The callback parameter should specify a function that looks like this:<br />
            /// - function() {...};
            /// </param>
        },

        // ------------------------------------------------------------------
        // Events
        // ------------------------------------------------------------------

        onClicked: {
            addListener: function(listener) {
                /// <summary>
                /// Fired when a browser action icon is clicked. This event will not fire if the browser action has a popup. 
                /// </summary>
                /// <param name="listener" type="Function">
                /// The listner should specify a function that looks like this:<br />
                /// - function((tabs.Tab) tab) {...};
                /// </param>
            }
        }

    },

    contextMenus: new function() {


        function OnClickData() {
            /// <field name="selectionText" type="String" optional="true">The text for the context selection, if any.</field>
            this.selectionText = null;

            /// <field name="checked" type="Boolean" optional="true">A flag indicating the state of a checkbox or radio item after it is clicked.</field>
            this.checked = null;

        }

        var x = new OnClickData().

    }

}

chrome.contextMenus.


