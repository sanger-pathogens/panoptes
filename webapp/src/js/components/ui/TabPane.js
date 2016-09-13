import React from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'mixins/PureRenderMixin';

let TabPane = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    title: React.PropTypes.string,
    active: React.PropTypes.bool, //Usually set by TabbedArea
    children: React.PropTypes.element,
    className: React.PropTypes.string
  },

  icon() {
    return (this.child.icon ? this.child.icon() : null) ||
           (this.props.children.props ? this.props.children.props.icon : null) ||
            "circle";
  },
  title() {
    return (this.child.title ? this.child.title() : null) ||
      (this.props.children.props ? this.props.children.props.title : null) ||
      "Untitled";
  },

  render() {
    const divProps = Object.assign({}, this.props);
    delete divProps.active;
    delete divProps.compId;

    let classes = {
      'tab-pane': true,
      'active': this.props.active
    };

    return (
      <div {...divProps} className={classNames(this.props.className, classes)}>
        {React.cloneElement(this.props.children, {ref: (node) => this.child = node})}
      </div>
    );
  }

});

module.exports = TabPane;
