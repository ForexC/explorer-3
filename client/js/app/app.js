var _ = require('lodash');
var React = require('react');
var Persistence = require('./modules/persistence/persistence.js');
var AppDispatcher = require('./dispatcher/AppDispatcher');
var AppComponent = require('./components/app.js');
var ProjectActions = require('./actions/ProjectActions');
var ExplorerActions = require('./actions/ExplorerActions');
var ExplorerUtils = require('./utils/ExplorerUtils');
var FormatUtils = require('./utils/FormatUtils');
var runValidations = require('./utils/ValidationUtils').runValidations;
var explorerValidations = require('./validations/ExplorerValidations').explorer;
var ProjectStore = require('./stores/ProjectStore');
var ExplorerStore = require('./stores/ExplorerStore');
var QueryStringUtils = require('./utils/QueryStringUtils');

function App(config) {
  this.appDispatcher = AppDispatcher;
  this.targetNode = document.getElementById(config.targetId);
  this.persistence = config.persistence || null;
  this.client = config.client;

  // Grab the persisted explorers if a persitence module was passed in
  if (this.persistence) {
    ExplorerActions.getPersisted(this.persistence);
  }

  // Create the project store and kick off fetching schema for it.
  ProjectActions.create({ client: this.client });

  // Create the main active explorer. Grab params form URL and load into new explorer.
  
  // TODO: Grab the saved query from the server if this is a saved query URL rather than just Query params.
  
  var explorerAttrs = _.assign(
    { id: FormatUtils.generateRandomId("TEMP-") },
    ExplorerUtils.formatQueryParams(QueryStringUtils.getQueryAttributes())
  );
  ExplorerActions.create(explorerAttrs);
  ExplorerActions.setActive(explorerAttrs.id);

  // Run the query for this explorer if it's valid
  if (!ExplorerUtils.isEmailExtraction(ExplorerStore.getActive()) && runValidations(explorerValidations, ExplorerStore.getActive()).isValid) {
    ExplorerActions.exec(this.client, ExplorerStore.getActive().id);
  }

  this.componentConfig = {
    persistence: this.persistence,
    options: config.options || {},
    client: this.client
  };
}

App.prototype.render = function() {
  var Component = React.createFactory(AppComponent);
  React.render(Component(this.componentConfig), this.targetNode);
};

window.React = React;
window.Keen = window.Keen || {};
window.Keen.DataTools = window.Keen.DataTools || {};
window.Keen.DataTools.Persistence = Persistence;
window.Keen.DataTools.App = module.exports = App;