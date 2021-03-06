import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'mixins/PureRenderMixin';
import _isArray from 'lodash.isarray';
import filterChildren from 'util/filterChildren';

//Child of CustomButton

let Anchor = createReactClass({
  displayName: 'Anchor',

  mixins: [
    PureRenderMixin,
  ],

  propTypes: {
    onClick: PropTypes.func,
  },

  render() {
    let {children} = this.props;
    children = filterChildren(this, children);
    if (_isArray(children)) {
      throw Error('Anchor can only have one child until https://github.com/facebook/react/issues/2127');
    }
    return React.cloneElement(children, {onClick: this.props.onClick});
  },
});

export default Anchor;
