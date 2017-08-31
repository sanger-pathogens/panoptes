import PropTypes from 'prop-types';
import React from  'react';
import createReactClass from 'create-react-class';
import NotificationSystem from 'react-notification-system';
import deserialiseComponent from 'util/deserialiseComponent'; // NB: deserialiseComponent is actually used.
import _assign from 'lodash.assign';
import SwipeableViews from 'react-swipeable-views';

// Mixins
import FluxMixin from 'mixins/FluxMixin';
import ConfigMixin from 'mixins/ConfigMixin';
import PureRenderMixin from 'mixins/PureRenderMixin';
import StoreWatchMixin from 'mixins/StoreWatchMixin';

// Panoptes
import Modal from 'ui/Modal';
import Copy from 'ui/Copy';
import Confirm from 'ui/Confirm';
import SessionComponent from 'panoptes/SessionComponent';
import HTMLWithComponents from 'panoptes/HTMLWithComponents';
import EmptyTab from 'containers/EmptyTab';
import DatasetManagerActions from 'components/DatasetManagerActions';


// Material UI
import createPalette from 'material-ui/styles/createPalette';
import createTypography from 'material-ui/styles/createTypography';
import {createMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import {withTheme} from 'material-ui/styles';
import {blue, pink, deepOrange, blueGrey} from 'material-ui/colors';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreVert from 'material-ui-icons/MoreVert';
import Tabs, { Tab } from 'material-ui/Tabs';

// Panoptes utils
import DetectResize from 'utils/DetectResize';

import 'font-awesome.css';
import 'ui-components.scss';
import 'main.scss';

const palette = createPalette({
  primary: deepOrange,
  secondary: blueGrey,
  genotypeRefColor: 'rgb(0, 128, 192)',
  genotypeAltColor: 'rgb(255, 50, 50)',
  genotypeHetColor: 'rgb(0, 192, 120)',
  genotypeNoCallColor: 'rgb(230, 230, 230)'
});

const fontStyle = {
  fontFamily: 'Roboto, sans-serif',
};

const muiTheme = createMuiTheme({
  palette,
  typography: createTypography(palette, fontStyle),
  tableHeaderColumn: {
    height: 56,
    spacing: 12,
    textColor: 'black'
  },
  tableRowColumn: {
    height: 48,
    spacing: 12,
  },
  overrides: {
    MuiListSubheader: {
      sticky: {
        backgroundColor: 'white'
      }
    }
  }
});

let Panoptes = createReactClass({
  displayName: 'Panoptes',

  mixins: [
    FluxMixin,
    ConfigMixin,
    PureRenderMixin,
    StoreWatchMixin('SessionStore', 'PanoptesStore')],

  propTypes: {
    theme: PropTypes.object
  },

  componentDidMount() {
    let store = this.getFlux().store('SessionStore');
    store.on('notify',
      () => this.refs.notificationSystem.addNotification(
        _assign(store.getLastNotification(), {position: 'tc'})));
    //We don't need this as it will come to us in page load json
    //this.getFlux().actions.api.fetchUser(this.state.panoptes.get('dataset'));
    console.info('Theme: %o', this.props.theme);
  },

  getStateFromFlux() {
    let {tabs, popups, components} = this.getFlux().store('SessionStore').getState().toObject();
    return {
      tabs,
      popups,
      components,
      modal: this.getFlux().store('SessionStore').getModal(),
      panoptes: this.getFlux().store('PanoptesStore').getState()
    };
  },

  handleResize() {
    this.getFlux().actions.session.appResize();
  },

  isDocPage(component) {
    return component.type === 'DocPage' ||  component.type ===  'DataItem';
  },

  handleChangeTab(event, index) {
    let actions = this.getFlux().actions.session;
    let {tabs,  components} = this.state;
    tabs = tabs.toJS();
    components = components.toJS();
    //Filter all the DocPage components to a list
    let docPages = [];
    let others = [];
    tabs.components.forEach((component) => {
      if (component !== 'FirstTab') {
        (this.isDocPage(components[component]) ? docPages : others).push(component);
      }
    });
    if (index === 0) {
      actions.tabSwitch('FirstTab');
    }
    if (index === 1) {
      actions.tabSwitch(docPages[docPages.length-1]);
    }
    if (index === 2) {
      actions.tabSwitch(others[others.length-1]);
    }
  },

  render() {
    let actions = this.getFlux().actions.session;
    let {tabs, popups, modal, components} = this.state;
    let config = this.config;
    tabs = tabs.toJS();
    components = components.toJS();
    //Filter all the DocPage components to a list
    let docPages = [];
    let others = [];
    tabs.components.forEach((component) => {
      (this.isDocPage(components[component]) ? docPages : others).push(component)
    });
    let tabIndex = 0;
    let selectedDocPage = 'InitialDocPage';
    let selectedOther = 'InitialOther';
    if (tabs.selectedTab !== "FirstTab" && docPages.indexOf(tabs.selectedTab) >= 0) {
      tabIndex = 1;
      selectedDocPage = tabs.selectedTab;
    }
    if (others.indexOf(tabs.selectedTab) >= 0) {
      tabIndex = 2;
      selectedOther = tabs.selectedTab;
    }
    // NB: initialConfig is actually defined (in index.html)
    return (
      <DetectResize onResize={this.handleResize}>
        <MuiThemeProvider theme={muiTheme}>
          <div>
            <div className="loading-container">
              <div className="spinner" />
            </div>
            <div className="page">
              <Header dataset={config.dataset} name={config.settings.nameBanner} logo={initialConfig.logo}/>
              <Tabs
                onChange={this.handleChangeTab}
                value={tabIndex}
                indicatorColor="primary"
                textColor="primary"
                centered
              >
                <Tab label="Home" />
                <Tab label="Guidebook" />
                <Tab label="Viewer" />
              </Tabs>
              <SwipeableViews
                index={tabIndex}
                onChangeIndex={this.handleChangeTab}
              >
                <div className="body scroll-within">
                  <SessionComponent compId={"FirstTab"} />
                </div>
                <div className="body scroll-within">
                  <SessionComponent compId={selectedDocPage} />
                </div>
                <div className="body scroll-within">
                  <SessionComponent compId={selectedOther} />
                </div>
              </SwipeableViews>
            </div>
            <Modal visible={!!modal}
              onClose={actions.modalClose}>
              {modal ?
                React.cloneElement(modal, {setProps: actions.modalSetProps})
                : null}
            </Modal>
            <NotificationSystem ref="notificationSystem"/>
          </div>
        </MuiThemeProvider>
      </DetectResize>
    );
  },
});

let Header = createReactClass({
  displayName: 'Header',

  mixins: [
    PureRenderMixin,
    ConfigMixin,
    FluxMixin,
  ],

  propTypes: {
    dataset: PropTypes.string,
    name: PropTypes.string,
    logo: PropTypes.string
  },

  getInitialState() {
    return {
      anchorEl: null,
      open: false
    }
  },

  handleClick(event) {
    this.setState({ open: true, anchorEl: event.currentTarget });
  },

  handleRequestClose() {
    this.setState({ open: false });
  },

  handlePageLinkClick() {
    let introContent = 'Here\'s the link for this page, which you can copy and paste elsewhere: ';
    let selectedContent = window.location.href;
    this.getFlux().actions.session.modalOpen(<Copy title="Page Link" introContent={introContent} selectedContent={selectedContent}/>);
  },

  handleSaveInitialSession() {
    let state = this.getFlux().store('SessionStore').getState().toJS();
    this.getFlux().actions.session.modalOpen(<Confirm
      title="Initial view"
      message="Save current app state as initial view for all users?"
      onConfirm={() => this.getFlux().actions.api.modifyConfig(
        {
          dataset: this.config.dataset,
          path: 'settings.initialSessionState',
          action: 'replace',
          content: state,
        }
      )}
    />);
  },

  render() {
    let {dataset, name, logo} = this.props;
    let actions = this.getFlux().actions;
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton color="contrast" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography type="title" color="inherit" onClick={() => actions.session.tabSwitch('FirstTab')}>
            {<span><img className="top-bar-logo" src={logo}/><HTMLWithComponents className="top-bar-title">{name}</HTMLWithComponents></span>}
          </Typography>
          {this.config.user.isManager ? [<IconButton
            style={{color: 'white'}}
            aria-label="More"
            aria-owns={this.state.open ? 'long-menu' : null}
            aria-haspopup="true"
            onClick={this.handleClick}
          >
            <MoreVert />
          </IconButton>,
          <Menu
            id="long-menu"
            anchorEl={this.state.anchorEl}
            open={this.state.open}
            onRequestClose={this.handleRequestClose}
          >
            <MenuItem selected={false} onClick={() => (this.handleRequestClose(), actions.session.tabOpen(<DatasetManagerActions />))}>Admin</MenuItem>
            <MenuItem selected={false} onClick={() => (this.handleRequestClose(), actions.session.tabOpen(<EmptyTab />))}>Table/View list</MenuItem>
            <MenuItem selected={false} onClick={() => (this.handleRequestClose(), window.location.href = this.config.cas.logout)}>Sign out</MenuItem>
          </Menu>] : this.config.cas.service ? <Button color="primary">
            <a style={{textDecoration:"inherit", color:'white'}} href={`${this.config.cas.service}?service=${window.location.href}`}>Login</a>
          </Button>: null
          }

        </Toolbar>
      </AppBar>
    );
  },
});

export default withTheme()(Panoptes);
