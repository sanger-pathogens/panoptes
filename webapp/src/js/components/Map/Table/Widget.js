import React from 'react';

// Mixins
import FluxMixin from 'mixins/FluxMixin';

// Panoptes components
import MapWidget from 'Map/Widget';
import FeatureGroupWidget from 'Map/FeatureGroup/Widget';
import TileLayerWidget from 'Map/TileLayer/Widget';
import TableMarkersLayerWidget from 'Map/TableMarkersLayer/Widget';


/* Example usage in templates

<p>A map of sampling sites:</p>
<div style="position:relative;width:300px;height:300px">
<TableMap table="samplingsites" />
</div>

<p>A map of a sampling site:</p>
<div style="position:relative;width:300px;height:300px">
<TableMap table="samplingsites" primKey="St04" />
</div>

*/

let TableMapWidget = React.createClass({

  mixins: [
    FluxMixin
  ],

  propTypes: {
    locationDataTable: React.PropTypes.string,
    primKey: React.PropTypes.string,
    table: React.PropTypes.string,
    title: React.PropTypes.string
  },

  title() {
    return this.props.title || 'Table Map';
  },

  render() {

    let {locationDataTable, primKey, table} = this.props;

    // NB: The table prop is passed by Panoptes, e.g. DataItem/Widget
    // The locationDataTable prop is named to distinguish it from the chartDataTable.
    // Either "table" or "locationDataTable" can be used in templates,
    // with locationDataTable taking preference when both are specfied.
    if (locationDataTable === undefined && table !== undefined) {
      locationDataTable = table;
    }

    // NB: Widgets and their children should always fill their container's height, i.e.  style={{height: '100%'}}. Width will fill automatically.
    // TODO: Turn this into a class for all widgets.
    let widgetStyle = {height: '100%'};

    return (
      <MapWidget style={widgetStyle}>
        <FeatureGroupWidget>
          <TileLayerWidget />
          <TableMarkersLayerWidget locationDataTable={locationDataTable} primKey={primKey} />
        </FeatureGroupWidget>
      </MapWidget>
    );

  }

});

module.exports = TableMapWidget;
