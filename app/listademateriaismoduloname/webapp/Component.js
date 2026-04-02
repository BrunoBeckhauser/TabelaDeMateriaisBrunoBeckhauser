sap.ui.define([
    "sap/ui/core/UIComponent"
], (UIComponent) => {
    "use strict";

    return UIComponent.extend("listademateriaismoduloname.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        }
    });
});
