const FilterComplexCore = require("../core/FilterComplexCore");

/**
 * @function _toInternal()
 * translate our external QB conditions into our internal format that
 * makes the cond.rule unique by adding the field.id to the rule.
 * @param {obj} cond
 *        the QB condition format we use exernally in our AB system.
 */
function _toInternal(cond) {
   if (cond.key) {
      if (cond.rule && cond.rule.indexOf(cond.key) == -1) {
         cond.rule = `${cond.key}_${cond.rule}`;
      }
   }

   if (cond.rules && cond.rules.length) {
      (cond.rules || []).forEach((r) => {
         _toInternal(r);
      });
   }
}

/**
 * @function _toExternal()
 * translate our internal QB conditions into our external format that
 * where the cond.rule no longer has the field.id.
 * @param {obj} cond
 *        the QB condition format we use internally
 */
function _toExternal(cond) {
   if (cond.key) {
      if (cond.rule && cond.rule.indexOf(cond.key) > -1) {
         cond.rule = cond.rule.replace(`${cond.key}_`, "");
      }
   }

   if (cond.rules && cond.rules.length) {
      (cond.rules || []).forEach((r) => {
         _toExternal(r);
      });
   }
}

module.exports = class FilterComplex extends FilterComplexCore {
   constructor(App, idBase, AB) {
      idBase = idBase || "ab_row_filter";

      super(App, idBase, AB);

      let L = App.Label;

      let labels = (this.labels = {
         common: (App || {}).labels,
         component: {
            and: L("ab.filter_fields.and", "*And"),
            or: L("ab.filter_fields.or", "*Or"),

            thisObject: L("ab.filter_fields.thisObject", "*This Object"),
            inQuery: L("ab.filter_fields.inQuery", "*In Query"),
            notInQuery: L("ab.filter_fields.notInQuery", "*Not In Query"),
            inQueryField: L("ab.filter_fields.inQueryField", "*By Query Field"),
            notInQueryField: L(
               "ab.filter_fields.notInQueryField",
               "*Not By Query Field"
            ),

            inQueryFieldQueryPlaceholder: L(
               "ab.filter_fields.inQueryFieldQueryPlaceholder",
               "*Choose a Query"
            ),
            inQueryFieldFieldPlaceholder: L(
               "ab.filter_fields.inQueryFieldFieldPlaceholder",
               "*Choose a Field"
            ),

            sameAsUser: L("ab.filter_fields.sameAsUser", "*Same As User"),
            notSameAsUser: L(
               "ab.filter_fields.notSameAsUser",
               "*Not Same As User"
            ),

            sameAsField: L("ab.filter_fields.sameAsFild", "*Same As Field"),
            notSameAsField: L("ab.filter_fields.notSameAsFild", "*Not Field"),

            inDataCollection: L(
               "ab.filter_fields.inDataCollection",
               "*In Data Collection"
            ),
            notInDataCollection: L(
               "ab.filter_fields.notInDataCollection",
               "*Not In Data Collection"
            ),

            containsCondition: L(
               "ab.filter_fields.containsCondition",
               "*contains"
            ),
            notContainsCondition: L(
               "ab.filter_fields.notContainsCondition",
               "*doesn't contain"
            ),
            isCondition: L("ab.filter_fields.isCondition", "*is"),
            isNotCondition: L("ab.filter_fields.isNotCondition", "*is not"),

            beforeCondition: L(
               "ab.filter_fields.beforeCondition",
               "*is before"
            ),
            afterCondition: L("ab.filter_fields.afterCondition", "*is after"),
            onOrBeforeCondition: L(
               "ab.filter_fields.onOrBeforeCondition",
               "*is on or before"
            ),
            onOrAfterCondition: L(
               "ab.filter_fields.onOrAfterCondition",
               "*is on or after"
            ),
            beforeCurrentCondition: L(
               "ab.filter_fields.beforeCurrentCondition",
               "*is before current date"
            ),
            afterCurrentCondition: L(
               "ab.filter_fields.afterCurrentCondition",
               "*is after current date"
            ),
            onOrBeforeCurrentCondition: L(
               "ab.filter_fields.onOrBeforeCurrentCondition",
               "*is on or before current date"
            ),
            onOrAfterCurrentCondition: L(
               "ab.filter_fields.onOrAfterCurrentCondition",
               "*is on or after current date"
            ),
            onLastDaysCondition: L(
               "ab.filter_fields.onLastDaysCondition",
               "*last ... days"
            ),
            onNextDaysCondition: L(
               "ab.filter_fields.onNextDaysCondition",
               "*next ... days"
            ),

            equalCondition: L("ab.filter_fields.equalCondition", ":"),
            notEqualCondition: L("ab.filter_fields.notEqualCondition", "≠"),
            lessThanCondition: L("ab.filter_fields.lessThanCondition", "<"),
            moreThanCondition: L("ab.filter_fields.moreThanCondition", ">"),
            lessThanOrEqualCondition: L(
               "ab.filter_fields.lessThanOrEqualCondition",
               "≤"
            ),
            moreThanOrEqualCondition: L(
               "ab.filter_fields.moreThanOrEqualCondition",
               "≥"
            ),

            equalListCondition: L(
               "ab.filter_fields.equalListCondition",
               "*equals"
            ),
            notEqualListCondition: L(
               "ab.filter_fields.notEqualListCondition",
               "*does not equal"
            ),

            checkedCondition: L(
               "ab.filter_fields.checkedCondition",
               "*is checked"
            ),
            notCheckedCondition: L(
               "ab.filter_fields.notCheckedCondition",
               "*is not checked"
            ),

            isCurrentUserCondition: L(
               "ab.filter_fields.isCurrentUserCondition",
               "*is current user"
            ),
            isNotCurrentUserCondition: L(
               "ab.filter_fields.isNotCurrentUserCondition",
               "*is not current user"
            ),
            containsCurrentUserCondition: L(
               "ab.filter_fields.containsCurrentUserCondition",
               "*contains current user"
            ),
            notContainsCurrentUserCondition: L(
               "ab.filter_fields.notContainsCurrentUserCondition",
               "*does not contain current user"
            ),
         },
      });

      // internal list of Webix IDs to reference our UI components.
      let ids = (this.ids = {
         filterForm: this.unique(idBase + "_rowFilter_form"),
         popup: this.unique(idBase + "_popup"),
         querybuilder: this.unique(idBase + "_querybuilder"),
         save: this.unique(idBase + "_save"),
      });

      // Set current username
      this.Account.username = this.AB.Account.username();

      // Default options list to push to all fields
      // this.queryFieldOptions = [
      //    {
      //       value: this.labels.component.inQueryField,
      //       id: "in_query_field"
      //    },
      //    {
      //       value: this.labels.component.notInQueryField,
      //       id: "not_in_query_field"
      //    }
      // ];

      this.recordRuleOptions = [];
      this.recordRuleFieldOptions = [];

      let _logic = this._logic || {};

      _logic.onChange = () => {
         if (!this.__blockOnChange) {
            _logic.callbacks.onChange();
         }

         return false;
      };

      // webix UI definition:
      this.ui = {
         rows: [
            {
               view: "form",
               id: ids.filterForm,
               type: "clean",
               borderless: true,
               // hidden: true,
               elements: [
                  {
                     view: "querybuilder",
                     id: ids.querybuilder,
                     fields: [],
                     filters: [],
                     on: {
                        onKeySelect: (form) => {
                           this.uiCustomValue(form);
                        },
                     },
                  },
               ],
            },
            {
               id: ids.save,
               view: "button",
               css: "webix_primary",
               value: L("ab.filter_fields.Save", "*Save"),
               click: () => {
                  if (this.myPopup) this.myPopup.hide();
                  this.emit("save", this.getValue());
                  _logic.onChange();
               },
            },
         ],
      };
   }

   // setting up UI
   init(options) {
      super.init(options);

      // register our callbacks:
      for (var c in this._logic.callbacks) {
         this._logic.callbacks[c] = options[c] || this._logic.callbacks[c];
      }

      // if (options.isRecordRule) {
      //    this.recordRuleOptions = [
      //       {
      //          value: this.labels.component.sameAsField,
      //          id: "same_as_field"
      //       },
      //       {
      //          value: this.labels.component.notSameAsField,
      //          id: "not_same_as_field"
      //       }
      //    ];
      //    this.recordRuleFieldOptions = options.fieldOptions;
      // }
   }

   /**
    * @method isValid
    * validate the row data is valid filter condition
    *
    * @param rowData {Object} - data row
    */
   isValid(rowData) {
      let helper = () => true;

      if ($$(this.ids.querybuilder))
         helper = $$(this.ids.querybuilder).getFilterHelper();

      return helper(rowData);
   }

   setValue(settings) {
      super.setValue(settings);
      if (!settings) return;

      if ($$(this.ids.querybuilder)) {
         let qbSettings = this.AB.cloneDeep(settings);

         // Settings should match a condition built upon our QB format:
         // {
         //    glue:"and",
         //    rules:[
         //       {
         //          key:"uuid",
         //          rule:"",
         //          value:""
         //       }
         //    ]
         // }
         // externally our key should be the field.id and the rules should be
         // the "contains", "not_contains", "equal" ... keywords.
         // However, internally, we convert these rules into .ids that are
         // unique for each field (see uiInit()).  So when we bring in settings
         // we need to translate them into our internal format:

         _toInternal(qbSettings);

         $$(this.ids.querybuilder).setValue(qbSettings);

         // Update custom value
         let $selectors = $$(this.ids.querybuilder).queryView(
            {
               view: "querybuilderline",
            },
            "all"
         );
         if ($selectors) {
            ($selectors || []).forEach(($sElem) => {
               this.uiCustomValue($sElem);
            });
         }
      }
   }

   getValue() {
      if ($$(this.ids.querybuilder)) {
         let settings = this.AB.cloneDeep(
            $$(this.ids.querybuilder).getValue() || {}
         );

         // what we pull out of the QB will have .rules in our internal format:
         // {field.id}_{rule}  (see uiInit() )
         // But we need to store them in our generic QB format for use outside
         // our FilterComplex widget.
         _toExternal(settings);
         this.condition = settings;
      }

      return super.getValue();
   }

   fieldsLoad(fields = [], object = null) {
      super.fieldsLoad(fields, object);
      this.uiInit();
   }

   toShortHand() {
      return "Add Filters";
   }

   uiInit() {
      let el = $$(this.ids.querybuilder);
      if (el) {
         // Set fields
         el.define("fields", this.fieldsToQB());

         // Set filters
         // the filters here are an array of Condition Options for each field.
         el.config.filters.clearAll();
         (this.filtersToQB() || []).forEach((filter) => {
            // .filtersToQB() generates an array of filters for each field,
            // but the filter.id here is the type of condition rule: contains, not_contains, etc...
            // we need the ID's to be unique, so we will make them unique to each field by adding
            // {field.id}_{condition.rule} so make the unique id.

            let type = Object.keys(filter.type)[0];
            // make sure to only update the filter.id 1x
            if (filter.id.indexOf(type) == -1) {
               filter.id = type + "_" + filter.id;
            }

            // now filter.id is unique.

            el.config.filters.add(filter);
         });
      }
   }

   uiCustomValue($selector) {
      if (
         !$selector ||
         !$selector.config ||
         !$selector.config.value ||
         !$selector.config.value.key
      )
         return;

      let columnName = $selector.config.value.key;
      let rule = $selector.config.value.rule;
      // let value = $selector.config.value.value;

      let $valueElem = $selector.queryView({ customEdit: true });
      if (!$valueElem) return;

      let field = this._Fields.filter((f) => f.columnName == columnName)[0];
      if (!field) return;

      if (rule == "in_query" || rule == "not_in_query") {
         this.uiInQueryValue($valueElem, field);
      } else if (
         rule == "in_data_collection" ||
         rule == "not_in_data_collection"
      ) {
         this.uiInDataCollectionValue($valueElem, field);
      } else if (field.key == "list") {
         this.uiListValue($valueElem, field);
      }
   }

   uiInQueryValue($value, field) {
      let options = [];
      let Queries = [];

      // populate the list of Queries for this_object:
      if (field.id == "this_object" && this._Object) {
         Queries = this.queries((q) => q.canFilterObject(this._Object));
      }
      // populate the list of Queries for a query field
      else {
         Queries = this.queries((q) => {
            return (
               (this._Object ? this._Object.id : "") != q.id && // Prevent filter looping
               q.canFilterObject(field.datasourceLink)
            );
         });
      }

      Queries.forEach((q) => {
         options.push({
            id: q.id,
            value: q.label,
         });
      });

      $value.define("options", options);
      $value.refresh();
   }

   uiInDataCollectionValue($value, field) {
      let options = [];

      // get id of the link object
      let linkObjectId;
      if (field.id == "this_object" && this._Object) {
         linkObjectId = this._Object.id;
      } else {
         linkObjectId = field.settings.linkObject;
      }

      // pull data collection list
      if (this._Application && linkObjectId) {
         options = this._Application
            .datacollections(
               (dc) => dc.datasource && dc.datasource.id == linkObjectId
            )
            .map((dc) => {
               return { id: dc.id, value: dc.label };
            });
      }

      $value.define("options", options);
      $value.refresh();
   }

   uiListValue($value, field) {
      let options = field.settings.options.map(function (opt) {
         return {
            id: opt.id,
            value: opt.text,
            hex: opt.hex,
         };
      });

      $value.define("options", options);
      $value.refresh();
   }

   popUp() {
      if (!this.myPopup) {
         let ui = {
            id: this.ids.popup,
            view: "popup",
            position: "center",
            height: 500,
            width: 1000,
            body: this.ui,
         };

         this.myPopup = webix.ui(ui);
      }

      if (this.application) {
         this.applicationLoad(this.application);
      }
      if (this.fields) {
         this.fieldsLoad(this.fields);
      }

      // NOTE: do this, before the .setValue() operation, as we need to have
      // our fields and filters defined BEFORE a setValue() is performed.
      this.uiInit();

      if (this.condition) {
         this.setValue(this.condition);
      }

      this.myPopup.show();
   }
};
