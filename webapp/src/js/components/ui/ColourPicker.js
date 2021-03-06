import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {BlockPicker} from 'react-color';
import PureRenderMixin from 'mixins/PureRenderMixin';

let ColourPicker = createReactClass({
  displayName: 'ColourPicker',
  mixins: [PureRenderMixin],

  propTypes: {
    colour: PropTypes.string,
    colours: PropTypes.array.isRequired,
    onPick: PropTypes.func,

  },

  render() {
    let {colour, colours, onPick} = this.props;
    return (
      <BlockPicker
        color={colour}
        colors={colours}
        triangle="hide"
        onChange={(colour) => onPick(colour.hex)} />
    );
  },
});

export default ColourPicker;
