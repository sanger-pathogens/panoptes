import React from 'react';
import {CircleMarker as LeafletCircle} from 'react-leaflet';

// Mixins
import FluxMixin from 'mixins/FluxMixin';

let Circle = React.createClass({

  mixins: [
    FluxMixin
  ],

  propTypes: {
    center: React.PropTypes.object,
    radius: React.PropTypes.number,
  },

  render() {
    let {center, radius} = this.props;
    return (
      <LeafletCircle
        children={null}
        center={center}
        radius={radius}
      />
    );
  }
});

export default Circle;