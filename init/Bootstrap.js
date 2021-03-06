/*
 * Bootstrap.js
 * This file drives the setup and preparation of the Web Platform.
 * It's main job is to prepare all the local Resources for operation as
 * well the main ABFactory object that will drive the rest of the applications.
 */

var Webix = require("../js/webix/webix.js");
// NOTE: changed to require() so switching to webix_debug.js will work.
import webixCSS from "../js/webix/webix.css";
// Make sure webix is global object
if (!window.webix) {
   window.webix = Webix;
}

import ABFactory from "../AppBuilder/ABFactory";

var EventEmitter = require("events").EventEmitter;

import BootstrapCSS from "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import Config from "../config/Config.js";

import FormIO from "../node_modules/formiojs/dist/formio.full.min.js";
import FormIOFormCSS from "../node_modules/formiojs/dist/formio.form.min.css";
import FormIOBuilderCSS from "../node_modules/formiojs/dist/formio.builder.min.css";
// import FormIOCSS from "../node_modules/formiojs/dist/formio.full.min.css";

import initConfig from "../init/initConfig.js";
import initDiv from "../init/initDiv.js";
// import initResources from "../init/initResources.js";

// import JSZipUtils from "jszip-utils/dist/jszip-utils.min.js";

var QueryBuilder = require("../js/webix/components/querybuilder/querybuilder.min.js");
// NOTE: changed QB to require() since import couldn't find the global webix object.
import querybuilderCSS from "../js/webix/components/querybuilder/querybuilder.min.css";

import Selectivity from "../js/selectivity/selectivity.min.js";
import selectivityCSS from "../js/selectivity/selectivity.min.css";

import tinymce from "../js/webix/extras/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/link";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/oxide/content.css"; // content.min.css ?
import "tinymce/skins/content/default/content.min.css";

import UI from "../ui/ui.js";

class Bootstrap extends EventEmitter {
   constructor(definitions) {
      super();
      this.setMaxListeners(0);

      // Common Reference to Configuration Values
      this.Config = Config;

      //
      // UI Related
      //

      this._div = null;
      // {el} _div
      // the HTML element that is the where our initial [click] here button
      // should be displayed.  Our actual portal is a popup, but the base
      // <div> can be used for an embedded view.

      this._ui = null;
      // {obj} ._ui
      // the Webix Object that is our UI display

      // TODO: make sure "error" s are handled and sent to logs
      // this.on("error", ()=>{ Analytics.error })
   }

   init() {
      // on the web platform, we need to gather the appropriate configuration
      // information before we can show the UI
      return (
         // 1) Find or create the DIV element our UI is to attach to
         //    this DIV element can contain settings pertainent to our setup
         initDiv
            .init(this)
            .then(() => {
               // 2) Request the User's Configuration Information from the
               //    server.
               return initConfig.init(this);
            })
            .then(() => {
               // 3) Now we have enough info, to create an instance of our
               //    {ABFactory} that drives the rest of the AppBuilder objects
               var definitions = Config.definitions() || null;
               this.AB = new ABFactory(definitions);

               if (!window.AB) window.AB = this.AB;
               // Make our Factory Global.
               // Transition: we still have some UI code that depends on accessing
               // our Factory as a Global var.  So until those are rewritten we will
               // make our factory Global.

               return this.AB.init();
            })
            .then(() => {
               // 4) Now we can create the UI and send it the {ABFactory}
               return Promise.resolve().then(() => {
                  // webix recommends wrapping any webix code in the .ready()
                  // function that executes after page loading.
                  webix.ready(() => {
                     // webix pro offers a feature that hides scroll bars by
                     // default for browsers that include them due to the user's
                     // UI. The experience becomes more like a touch interface
                     // with the exception that scroll bars appear when user
                     // hovers over a scrollable area
                     if (!webix.env.touch && webix.env.scrollSize)
                        webix.CustomScroll.init();

                     var div = this.div();

                     UI.attach(div.id);
                     this.ui(UI);
                     this.ui().init(this.AB);
                     // this.ui().init() routine handles the remaining
                     // bootup/display process.
                  });
               });
            })
      );
   }

   alert(options) {
      Webix.alert(options);
   }

   div(el) {
      if (el) {
         this._div = el;
         return;
      }
      return this._div;
   }

   error(message) {
      console.error(message);
      this.emit(message);
   }

   ui(UI) {
      if (UI) {
         this._ui = UI;
         return;
      }
      return this._ui;
   }
}

export default new Bootstrap();
