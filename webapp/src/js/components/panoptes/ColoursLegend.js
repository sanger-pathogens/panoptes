import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'mixins/PureRenderMixin';
import LegendElement from 'panoptes/LegendElement';

let ColoursLegend = createReactClass({
  displayName: 'ColoursLegend',

  mixins: [
    PureRenderMixin
  ],

  propTypes: {
    colours: PropTypes.object.isRequired,
    maxLegendItems: PropTypes.number
  },

  render() {
    let {colours, maxLegendItems} = this.props;

    let legendElements = Object.keys(colours).sort().map(
      (colour) =>
        <LegendElement key={colour} name={colours[colour].name} colour={colour} />
    );

    return <div className="legend">
      {maxLegendItems === undefined || (maxLegendItems !== undefined && legendElements.length < maxLegendItems) ?
        legendElements
        : legendElements.slice(0, maxLegendItems).concat([<div key="more" className="legend-element">+{legendElements.length - maxLegendItems} more</div>])
      }
    </div>;
  },
});

export default ColoursLegend;
