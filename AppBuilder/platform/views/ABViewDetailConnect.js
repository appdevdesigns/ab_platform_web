const ABViewDetailConnectCore = require("../../core/views/ABViewDetailConnectCore");
const ABViewPropertyAddPage = require("./viewProperties/ABViewPropertyAddPage");

module.exports = class ABViewDetailConnect extends ABViewDetailConnectCore {
   ///
   /// Instance Methods
   ///

   /**
    * @method fromValues()
    *
    * initialze this object with the given set of values.
    * @param {obj} values
    */
   fromValues(values) {
      super.fromValues(values);

      this.addPageTool.fromSettings(this.settings);
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      let commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      let idBase = "ABViewDetailConnectPropertyEditor";

      if (this.addPageProperty == null) {
         this.addPageProperty = ABViewPropertyAddPage.propertyComponent(
            App,
            idBase
         );
         this.addPageProperty.init({
            onSave: () => {
               let currView = _logic.currentEditObject();
               if (!currView) return;

               // refresh settings
               this.propertyEditorValues(ids, currView);

               // trigger a save()
               this.propertyEditorSave(ids, currView);
            },
         });
      }

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([this.addPageProperty.ui]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      this.addPageProperty.setSettings(view, view.settings);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings = this.addPageProperty.getSettings(view);

      // refresh settings of app page tool
      view.addPageTool.fromSettings(view.settings);
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @param {string} idPrefix
    *
    * @return {obj} UI component
    */
   component(App, idPrefix) {
      let idBase = "ABViewDetailConnect_" + (idPrefix || "") + this.id;
      let baseComp = super.component(App, idBase);

      let addPageComponent = this.addPageTool.component(App, idBase);

      let _init = (options) => {
         baseComp.init(options);

         addPageComponent.applicationLoad(this.application);
         addPageComponent.init({
            // TODO : callbacks
         });
      };

      // Add plus button in front of template
      baseComp.ui.template = baseComp.ui.template.replace(
         "#display#",
         addPageComponent.ui + " #display#"
      );

      // Click to open new data form
      baseComp.ui.onClick = baseComp.ui.onClick || {};
      baseComp.ui.onClick["ab-connect-add-new-link"] = (e, id, trg) => {
         e.stopPropagation();

         // TODO: busy cursor

         let dc;
         let detail = this.detailComponent();
         if (detail) dc = detail.datacollection;

         setTimeout(() => {
            addPageComponent.onClick(dc).then(() => {
               // TODO: ready cursor
            });
         }, 50);

         return false;
      };

      return {
         ui: baseComp.ui,

         init: _init,
         logic: baseComp.logic,
      };
   }

   get addPageTool() {
      if (this.__addPageTool == null)
         this.__addPageTool = new ABViewPropertyAddPage();

      return this.__addPageTool;
   }
};
