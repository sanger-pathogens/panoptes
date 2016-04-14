import React from 'react';

// Mixins
import PureRenderMixin from 'mixins/PureRenderMixin';
import FluxMixin from 'mixins/FluxMixin';

// Material UI
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

import Icon from 'ui/Icon';

let Finder = React.createClass({
  mixins: [
    PureRenderMixin,
    FluxMixin
  ],

  getDefaultProps() {
    return {
      title: 'Find',
      icon: 'search'
    };
  },

  icon() {
    return this.props.icon;
  },
  title() {
    return this.props.title;
  },

  handleClick({container, props, middleClick}) {
    this.getFlux().actions.session.modalClose();
    this.getFlux().actions.session.modalOpen('containers/GeneFinder', {});
  },

  render() {
    return (
      <List>
        <ListItem primaryText="Find gene"
                  leftIcon={<div><Icon fixedWidth={true} name="bitmap:genomebrowser.png"/></div>}
                  onClick={this.handleClick}
        />
        <ListItem primaryText="Find sample"
                  leftIcon={<div><Icon fixedWidth={true} name="flask"/></div>}
                  onClick={this.handleClick}
        />
      </List>
    );
  }
});

module.exports = Finder;
