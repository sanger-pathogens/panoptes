import React from 'react';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

// Mixins
import PureRenderMixin from 'mixins/PureRenderMixin';
import FluxMixin from 'mixins/FluxMixin';
import StoreWatchMixin from 'mixins/StoreWatchMixin';

import Draggable from 'react-draggable';
import {Resizable} from 'react-resizable';
import 'react-resizable/css/styles.css';
import Icon from 'ui/Icon';


let Popup = React.createClass({
  mixins: [
    PureRenderMixin,
    FluxMixin,
    StoreWatchMixin('SessionStore')
  ],

  propTypes: {
    initialPosition: ImmutablePropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    }),
    initialSize: ImmutablePropTypes.shape({
      width: React.PropTypes.number,
      height: React.PropTypes.number
    }),
    onMoveStop: React.PropTypes.func,
    onResizeStop: React.PropTypes.func,
    onClose: React.PropTypes.func,
    onMaximise: React.PropTypes.func,
    onClick: React.PropTypes.func,
    children: React.PropTypes.element,
    cascadePositionOffset: ImmutablePropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    })
  },

  getDefaultProps() {
    return {
      initialPosition: Immutable.Map({
        x: 100,
        y: 100
      }),
      initialSize: Immutable.Map({
        width: 700,
        height: 500
      }),
      cascadePositionOffset: Immutable.Map({
        x: 10,
        y: 20
      })
    };
  },

  getInitialState() {
    return {
      position: this.props.initialPosition,
      size: this.props.initialSize,
      icon: null,
      title: null
    };
  },

  getStateFromFlux() {
    return {
      numberOfPopups: this.getFlux().store('SessionStore').getState().get('popups').getIn(['components']).size
    };
  },

  componentWillMount() {

    let positionOffsetX = (this.state.numberOfPopups - 1) * this.props.cascadePositionOffset.get('x');
    let positionOffsetY = (this.state.numberOfPopups - 1) * this.props.cascadePositionOffset.get('y');

    this.setState({position: Immutable.Map({x: this.props.initialPosition.get('x') + positionOffsetX, y: this.props.initialPosition.get('y') + positionOffsetY})});

  },

  componentDidMount() {
    this.componentDidUpdate();
  },

  componentDidUpdate() {
    let {child} = this.refs;
    if (child) {
      child.icon ? this.setState({icon: child.icon()}) : null;
      child.title ? this.setState({title: child.title()}) : null;
    }
  },

  handleResize(event, {element, size}) { //eslint-disable-line no-unused-vars
    this.setState((prev) => ({
      size: prev.size.merge(size)
    }));
  },
  handleResizeStop(event, {element, size}) { //eslint-disable-line no-unused-vars
    if (this.props.onResizeStop)
      this.props.onResizeStop(size);
  },
  handleMoveStop(event, ui) {
    let {x, y} = ui;
    if (this.props.onMoveStop)
      this.props.onMoveStop({x, y});
  },
  handleClose(event) {
    if (this.props.onClose) {
      event.preventDefault();
      event.stopPropagation();
      this.props.onClose();
    }
  },
  handleMaximise(event) {
    if (this.props.onMaximise) {
      event.preventDefault();
      event.stopPropagation();
      this.props.onMaximise();
    }
  },
  handleClick(event) {
    if (this.props.onClick)
      this.props.onClick(event);
  },

  render() {
    let {children, ...other} = this.props;
    let {icon, title, position, size} = this.state;

    if (!children)
      return null;
    return (
      <Draggable handle=".popup-drag"
                 defaultPosition={position.toObject()}
                 onStart={this.handleClick}
                 onStop={this.handleMoveStop}>
        <Resizable width={size.get('width')} height={size.get('height')}
                   minConstraints={[50, 50]}
                   handleSize={[20, 20]}
                   onResize={this.handleResize}
                   onResizeStop={this.handleResizeStop}>
          <div className="popup"
               style={size.toObject()}
               {...other}>
            <div className="popup-header">
              {icon ? <Icon name={icon}/> : null}
              <div className="title">{title}</div>
              <Icon className="pointer close" name="folder-o" onClick={this.handleMaximise}/>
              <Icon className="pointer close" name="close" onClick={this.handleClose}/>
            </div>
            <div className="popup-body">
              {React.cloneElement(children, {ref: 'child'})}
            </div>
            <div className="popup-drag"></div>
          </div>
        </Resizable>
      </Draggable>
    );
  }

});

module.exports = Popup;
