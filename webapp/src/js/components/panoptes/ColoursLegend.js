import React from 'react';
import PureRenderMixin from 'mixins/PureRenderMixin';
import LegendElement from 'panoptes/LegendElement';

let ColoursLegend = React.createClass({
  mixins: [
    PureRenderMixin
  ],

  propTypes: {
    colours: React.PropTypes.object.isRequired
  },

  render() {
    let {colours} = this.props;

    return <div className="legend">
    {Object.keys(colours).sort().map(
      (colour) =>
      <LegendElement key={colour} name={colours[colour].name} colour={colour} />
    )}
    </div>;
  }
});

export default ColoursLegend;