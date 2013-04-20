var UTILS = {

    // ------------------------------------------------------------------
    // Object Helpers
    // ------------------------------------------------------------------

    OBJ: {

        updateByPath: function (obj, keyStr, value) {

            /// <summary>Update a property of an object using a key path</summary>
            /// <param name="obj" type="Object">The Object to update</param>
            /// <param name="keyStr" type="String">e.g. prop1.innerProp2.innerProp3</param>
            /// <param name="value" type="*"></param>
        },

        getByPath: function (obj, key, remaining) {

            /// <summary>Get a property of an object by key path</summary>
            /// <param name="obj" type="Object">The Object to update</param>
            /// <param name="key" type="String">e.g. prop1.innerProp2.innerProp3</param>
            /// <returns type="*">Item</returns>
        }

    },

    ARRAY: {

        getIndexByObjectPropertyValue: function (arr, prop, val) {

            /// <summary>Get the index of an object inside an array from a value of the object</summary>
            /// <param name="arr" parameterArray="true" type="Array" elementType="Object">The Array of Objects to search</param>
            /// <param name="prop" type="String">e.g. prop1.innerProp2.innerProp3</param>
            /// <param name="val" type="*">Value of property to check against</param>
            /// <returns type="Number" integer="true">Index</returns>

        }

    },

    DOM: {

        id: function (e) {
           
            /// <summary>Get an HTML Element by id</summary>
            /// <param name="e" type="String">Id of the element</param>
            /// <returns type="HTMLElement">HTML Element</returns>
            
        },

        sel: function (q, c) {
            
            /// <summary>Get an HTML Element by query</summary>
            /// <param name="q" type="String">Query (document.querySelectorAll(q))</param>
            /// <param name="c" type="String">Context</param>
            /// <returns type="Array" parameterArray="true" elementType="HTMLElement">Matching HTML Elements</returns>

        },

        create: function (e) {

            /// <summary>Creates an HTML Element</summary>
            /// <param name="e" type="String">Type of element</param>
            /// <returns type="HTMLElement">HTML Element</returns>

        }

    },

    EventDispatcher: function (events) {

        /// <summary>Dispatcher for arbitrary events</summary>
        /// <param name="events" parameterArray="true" type="Array" elementType="String">An Array of event names</param>
        /// <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>

        this.getListeners = function (title) {

            /// <summary>Get the listeners for a particular event title</summary>
            /// <param name="title" type="String">Title of the event</param>
            /// <returns parameterArray="true" type="Array" elementType="Object">List of event objects associated with the title</returns>

        }

        this.addEventListener = function (title, method, handler) {
           
            /// <signature>
            ///     <summary>Add event listener</summary>
            ///     <param name="title" type="String">Title of the event</param>
            ///     <param name="method" type="Function">Method invoked when event is dispatched</param>
            ///     <param name="handler" type="string" optional="true">Handler identifier</param>
            ///     <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>
            /// </signature>
            /// <signature>
            ///     <summary>Add event listener</summary>
            ///     <param name="title" parameterArray="true" type="Array" elementType="String">Array of titles associated with the event</param>
            ///     <param name="method" type="Function">Method invoked when event is dispatched</param>
            ///     <param name="handler" type="string" optional="true">Handler identifier</param>
            ///     <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>
            /// </signature>

        };

        this.removeEventListener = function (title, method) {
            
            /// <summary>Remove event</summary>
            /// <param name="title" type="String">Title of the event</param>
            /// <param name="method" type="Function">Method signature of event</param>
            /// <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>

        };

        this.dispatchEvent = function (title, args) {
           
            /// <summary>Dispatch event</summary>
            /// <param name="title" type="String">Title of the event</param>
            /// <param name="args" type="*" optional="true">Arguments to be passed into the handling method</param>
            /// <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>

        };

        this.removeAllEventListeners = function () {

            /// <summary>Removes all events</summary>
            /// <returns type="UTILS.EventDispatcher">Event Dispatcher</returns>

        };

        this.removeEventListenersByHandler = function (title, handler) {
            
            /// <summary>Removes event by handler</summary>
            /// <param name="title" type="String">Title of the event</param>
            /// <param name="handler" type="String">Handler the event</param>

        };

        return this;

    },

    PortMessenger: function () {

        this.getConnectedPorts = function (portName) {

            /// <summary>Gets ports by name</summary>
            /// <param name="portName" type="String">Name of the port</param>
            /// <returns type="Array" parameterArray="true" elementType="chrome.extension.Port">Array of ports</returns>

        }

        this.sendMessage = function (portName, message, tab) {

            /// <summary>Gets ports by name</summary>
            /// <param name="portName" type="String">Name of the port</param>
            /// <param name="message" type="*">Message to send the port</param>
            /// <param name="tab" type="chrome.tabs.Tab" optional="true">Tab to send to. If not supplied, will send to all.</param>

        }

    },

    RequestMessenger: function () {

        Function.apply(this, new UTILS.EventDispatcher(["CONNECT", "DISCONNECT"]));

    },

    Tab: {

    	toImage: function (imageOptions, injectPath, untilY) {

            /// <summary>Capture the full tab into an image</summary>
            /// <param name="imageOptions" type="Object" optional="true">Quality and image type parameters</param>
            /// <param name="injectPath" type="string">Path to the injection script</param>
        	/// <param name="untilY" type="Number" optional="true">Capture until a Y position</param>

        }

    },


    // ------------------------------------------------------------------
    // Local Store Data Access Layer
    // ------------------------------------------------------------------

    LocalStoreDAL: function (storage, defaultModel) {

        /// <summary>localStorage Data Access Layer</summary>
        /// <param name="storage" type="String">Name of the storage</param>
        /// <param name="defaultModel" type="Object" optional="true">Default data</param>
        
        /// <field name="storage" type="String">Name of the storage</field>
        this.storage = storage;

        this.set = function (key, val) {

            /// <summary>Sets storage by key path</summary>
            /// <param name="key" type="String">e.g. prop1.innerProp2.innerProp3</param>
            /// <param name="val" type="*">Value to store</param>

        };

        this.get = function (key) {

            /// <summary>Get from storage by key path</summary>
            /// <param name="key" type="String">e.g. prop1.innerProp2.innerProp3</param>
            /// <returns type="*">Data</returns>

        };

        this.reset = function (newModel) {

            /// <summary>Reset storage</summary>
            /// <param name="newModel" type="Object" optional="true">Reset with new default data</param>

        };

        this.delete = function () {

            /// <summary>Delete storage</summary>
        }

    },

    // ------------------------------------------------------------------
    // Ajax
    // ------------------------------------------------------------------

    XHR: {

        ManagedEvent: function (xhrWrap, evtD) {

            /// <summary>Managed Event Object used for the Manager</summary>
            /// <param name="xhrWrap" type="Function">Function to be called containing xmlHttpRequest logic</param>
            /// <param name="evtD" type="UTILS.EventDispatcher">Event Dispatcher</param>
            /// <returns type="Object">ManagedEvent Object</returns>

        },

        Manager: function (maxCon) {

            /// <summary>Manager for xmlHttpRequests that ties in an event dispatcher</summary>
            /// <param name="maxCon" type="Number" integer="true" optional="true">Maximum number of concurrent connections</param>

            /// <field name="currentConnections" type="Number" integer="true">Current connections</field>
            this.currentConnections = 0;

            this.queue = function (managedEvent) {

                /// <summary>Add a Managed Event to the queue</summary>
                /// <param name="managedEvent" type="UTILS.XHR.ManagedEvent">Managed Event to queue</param>
                /// <returns type="UTILS.EventDispatcher">Event Dispatcher (for chaining)</returns>

            };

        }

    }

}

// Because __proto__ isn't in IE, therefore intellisense
UTILS.PortMessenger.prototype = UTILS.RequestMessenger.prototype = new UTILS.EventDispatcher(["CONNECT", "DISCONNECT"]);