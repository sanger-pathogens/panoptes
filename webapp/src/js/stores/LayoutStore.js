const Fluxxor = require('fluxxor');
const Immutable = require('immutable');
const uid = require('uid');
const Constants = require('../constants/Constants');
const LAYOUT = Constants.LAYOUT;

//For mock data:
const SQL = require('panoptes/SQL');

const EMPTY_TAB = 'containers/EmptyTab';

var LayoutStore = Fluxxor.createStore({

  initialize() {
    this.state = Immutable.fromJS({
      components: {
        'Table': {
          component: 'containers/DataTableWithQuery',
          props: {
            compId: 'Table',
            dataset: initialConfig.dataset,
            table: 'variants',
            query: SQL.WhereClause.encode(SQL.WhereClause.Trivial()),
            order: null,
            columns: ["chromosome", "position", "SnpName", "NRAF_EAF"]

          }
        },
        'EmptyTab': {
          component: EMPTY_TAB
        },
      },
      tabs: {
        selectedTab: 'Table',
        components: ['Table']
      },
      popups: {
        components: [],
        state: {
          'Table': {
            position: {
              x: 0,
              y: 0
            },
            size: {
              width: 300,
              height: 200
            }
          }
        }
      },
      modal: {
        //component:'containers/QueryPicker',
        //props: {
        //  table: 'variants'
        //}
      }
    });

    this.bindActions(
      LAYOUT.COMPONENT_UPDATE, this.emitIfNeeded(this.componentUpdate),
      LAYOUT.MODAL_CLOSE, this.emitIfNeeded(this.modalClose),
      LAYOUT.MODAL_OPEN, this.emitIfNeeded(this.modalOpen),
      LAYOUT.NOTIFY, this.emitIfNeeded(this.notify),
      LAYOUT.POPUP_CLOSE, this.emitIfNeeded(this.popupClose),
      LAYOUT.POPUP_FOCUS, this.emitIfNeeded(this.popupFocus),
      LAYOUT.POPUP_MOVE, this.emitIfNeeded(this.popupMove),
      LAYOUT.POPUP_OPEN, this.emitIfNeeded(this.popupOpen),
      LAYOUT.POPUP_RESIZE, this.emitIfNeeded(this.popupResize),
      LAYOUT.TAB_CLOSE, this.emitIfNeeded(this.tabClose),
      LAYOUT.TAB_OPEN, this.emitIfNeeded(this.tabOpen),
      LAYOUT.TAB_POP_OUT, this.emitIfNeeded(this.tabPopOut),
      LAYOUT.TAB_SWITCH, this.emitIfNeeded(this.tabSwitch)
    );
  },

  emitIfNeeded(action, event="change") {
    return (payload) => {
      let old_state = this.state;
      action(payload);
      if (!old_state.equals(this.state))
        this.emit(event);
    }
  },

  componentUpdate(payload) {
    let {compId, updater, newComponent} = payload;
    if (newComponent) {
      if (_.isFunction(updater)) {
        this.state = this.state.setIn(['components', compId], Immutable.fromJS({component: newComponent, props:{}}));
        this.state = this.state.updateIn(['components', compId, 'props'], updater);
      }
      else {
        let component = Immutable.fromJS({
          component: newComponent,
          props: updater
        });
        this.state = this.state.setIn(['components', compId], component);
      }
    }
    else {
      if (_.isFunction(updater)) {
        this.state = this.state.updateIn(['components', compId, 'props'], updater);
      }
      else {
        this.state = this.state.mergeDeepIn(['components', compId, 'props'], updater);
      }
    }
  },
  modalClose() {
    this.state = this.state.set('modal', Immutable.Map());
  },

  modalOpen(payload) {
    this.state = this.state.set('modal', Immutable.fromJS(payload));
  },

  notify(payload) {
    this.lastNotification = payload;
  },

  popupClose(payload) {
    let {compId} = payload;
    let list = this.state.getIn(['popups', 'components']).filter((popupId) => popupId !== compId);
    this.state = this.state.setIn(['popups', 'components'], list);
  },

  popupFocus(payload) {
    let {compId} = payload;
    this.state = this.state.updateIn(['popups', 'components'],
      (list) => list.filter((popupId) => popupId !== compId).push(compId));
  },

  popupMove(payload) {
    let {compId, pos} = payload;
    this.state = this.state.mergeIn(['popups', 'state', compId, 'position'], pos);
  },

  popupOpen(payload) {
    let {component, compId} = payload;
    if (compId)
      this.state = this.state.updateIn(['popups', 'components'],
        (list) => list.filter((popupId) => popupId !== compId).push(compId));
    else {
      if (!component.component)
        component.component = EMPTY_TAB;
      component = Immutable.fromJS(component);
      let id = uid(10);
      this.state = this.state.setIn(['components', id], component);
      this.state = this.state.updateIn(['popups', 'components'], (list) => list.push(id));
    }
  },

  popupResize(payload) {
    let {compId, size} = payload;
    this.state = this.state.mergeIn(['popups', 'state', compId, 'size'], size);
  },

  tabClose(payload, force) {
    let {compId} = payload;
    //Closing the lone empty tab is a no-op
    if (!force && this.state.getIn(['tabs', 'components']).size == 1 &&
      this.state.getIn(['components', compId, 'component']) === EMPTY_TAB)
      return;
    let pos = this.state.getIn(['tabs', 'components']).indexOf(compId);
    if (pos === -1)
      throw Error("Closed non-existant tab");
    let new_tabs = this.state.getIn(['tabs', 'components']).delete(pos);
    this.state = this.state.setIn(['tabs', 'components'], new_tabs);
    if (new_tabs.size == 0) {
      this.tabOpen({
        component: {component: EMPTY_TAB},
        switchTo: true
      });
    } else {
      if (compId === this.state.getIn(['tabs', 'selectedTab']))
        if (pos < new_tabs.size)
          this.state = this.state.setIn(['tabs', 'selectedTab'], new_tabs.get(pos));
        else
          this.state = this.state.setIn(['tabs', 'selectedTab'], new_tabs.last());
    }
  },
  tabOpen(payload) {
    let {component, switchTo, compId} = payload;
    if (compId)
      this.state = this.state.updateIn(['popups', 'components'],
        (list) => list.filter((popupId) => popupId !== compId).push(compId));
    else {
      if (!component.component)
        component.component = EMPTY_TAB;
      component = Immutable.fromJS(component);
      let id = uid(10);
      this.state = this.state.setIn(['components', id], component);
      this.state = this.state.updateIn(['tabs', 'components'], (list) => list.push(id));
      if (switchTo)
        this.state = this.state.setIn(['tabs', 'selectedTab'], id);
    }
  },
  tabPopOut(payload) {
    let {compId, pos} = payload;
    this.state = this.state.updateIn(['popups', 'components'],
      (list) => list.filter((popupId) => popupId !== compId).push(compId));
    if (pos)
      this.state = this.state.mergeIn(['popups','state', compId, 'position'], pos);
    this.tabClose(payload, true);
  },
  tabSwitch(payload) {
    this.state = this.state.setIn(['tabs', 'selectedTab'], payload.compId);
  },

  getState() {
    return this.state;
  },

  getLastNotification() {
    return this.lastNotification;
  }

});

module.exports = LayoutStore;
