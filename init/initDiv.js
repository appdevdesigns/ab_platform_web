/*
 * initDiv.js
 * find or create an initial <div> for our Appbuilder portal
 */
export default {
   init: (BS) => {
      // BS {Bootstrap}
      // The initial Bootstrap object found in "./Bootstrap.js"

      return new Promise((resolve, reject) => {
         // find our initial <div appbuilder-portal="default" /> tag
         var div = document.querySelector("div[appbuilder-portal]");
         if (!div) {
            div = document.createElement("Div");
            div.setAttribute("appbuilder-portal-autoenter", "true");
            div.setAttribute("appbuilder-portal-fullscreen", "true");
            document.getElementsByTagName("body")[0].appendChild(div);
         }
         // make sure there is a div.id set:
         if (!div.id) {
            div.id = "AppBuilder";
         }
         BS.div(div);
         BS.Config.settingsFromDiv(div); // set the autoEnter config
         resolve();
      });
   },
};
