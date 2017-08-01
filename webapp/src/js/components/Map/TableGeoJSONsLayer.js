import React from 'react';
import FluxMixin from 'mixins/FluxMixin';
import _isEmpty from 'lodash/isEmpty';
import FeatureGroup from 'Map/FeatureGroup';
import SQL from 'panoptes/SQL';
import {propertyColour} from 'util/Colours';
import ColourPropertyLegend from 'panoptes/ColourPropertyLegend';
import MapControlComponent from 'Map/MapControlComponent';
import GeoJSON from 'GeoJSON';
import withAPIData from 'hoc/withAPIData';

const DEFAULT_GEOJSON_FILL_COLOUR = '#3d8bd5';

let TableGeoJSONsLayer = React.createClass({

  mixins: [
    FluxMixin
  ],

  //NB: layerContainer and map might be provided as props rather than context (e.g. <Map><GetsProps><GetsContext /></GetsProps></Map>
  // in which case, we copy those props into context. Props override context.

  contextTypes: {
    layerContainer: React.PropTypes.object,
    map: React.PropTypes.object,
    changeLayerStatus: React.PropTypes.func
  },
  propTypes: {
    layerContainer: React.PropTypes.object,
    map: React.PropTypes.object,
    query: React.PropTypes.string,
    table: React.PropTypes.string.isRequired,
    colourProperty: React.PropTypes.string,
    geoJsonProperty: React.PropTypes.string.isRequired,
    labelProperty: React.PropTypes.string,
    maxLegendItems: React.PropTypes.number,
    config: React.PropTypes.object, // This will be provided via withAPIData
    data: React.PropTypes.array // This will be provided via withAPIData
  },
  childContextTypes: {
    layerContainer: React.PropTypes.object,
    map: React.PropTypes.object
  },

  getChildContext() {
    return {
      layerContainer: this.props.layerContainer !== undefined ? this.props.layerContainer : this.context.layerContainer,
      map: this.props.map !== undefined ? this.props.map : this.context.map
    };
  },

  getInitialState() {
    return {
      geoJSONs: []
    };
  },

  getDefaultProps() {
    return {
      query: SQL.nullQuery,
    };
  },

  getDefinedQuery(query, table) {
    return (query || this.props.query) ||
      ((table || this.props.table) ? this.props.config.tablesById[table || this.props.table].defaultQuery : null) ||
      SQL.nullQuery;
  },

  render() {

    let {layerContainer, map} = this.context;
    let {colourProperty, table, labelProperty, geoJsonProperty, maxLegendItems, config, data} = this.props;

    if (data === undefined || data === null) {
      return null;
    }

    // Translate the apiData data into GeoJSONs.
    let geoJSONs = [];

    let tableConfig = config.tablesById[table];
    let primKeyProperty = tableConfig.primKey;

    for (let i = 0; i < data.length; i++) {

      let primKey = data[i][primKeyProperty];

      let valueAsColour = DEFAULT_GEOJSON_FILL_COLOUR;
      let value = undefined;
      if (colourProperty !== undefined && colourProperty !== null) {
        let colourFunction = propertyColour(config.tablesById[table].propertiesById[colourProperty]);
        let nullifiedValue = (data[i][colourProperty] === '' ? null : data[i][colourProperty]);
        valueAsColour = colourFunction(nullifiedValue);
        value = nullifiedValue;
      }

      let json = JSON.parse(data[i][geoJsonProperty]);

      let geoJSON = {
        table,
        primKey,
        title: labelProperty !== undefined ? labelProperty : primKey,
        valueAsColour,
        value,
        json
      };

      geoJSONs.push(geoJSON);

    }

    if (_isEmpty(geoJSONs)) {
      return null;
    }

    return (
      <FeatureGroup
        layerContainer={layerContainer}
        map={map}
      >
        {colourProperty ?
          <MapControlComponent position="bottomleft">
            <ColourPropertyLegend
              colourProperty={colourProperty}
              table={table}
              labelProperty={labelProperty}
              maxLegendItems={maxLegendItems}
            />
          </MapControlComponent>
          : null
        }
        <FeatureGroup>
          {
            geoJSONs.map(
              (geoJSON, i) =>
                <GeoJSON
                  key={'GeoJSON_' + i}
                  json={geoJSON.json}
                  colour={geoJSON.valueAsColour}
                  weight={geoJSON.weight}
                  opacity={geoJSON.opacity}
                />
            )
          }
        </FeatureGroup>
      </FeatureGroup>
    );


  }


});


TableGeoJSONsLayer = withAPIData(TableGeoJSONsLayer, ({config, props}) => {

  let {table, query, colourProperty, geoJsonProperty, labelProperty} = props;

  let tableConfig = config.tablesById[table];
  if (tableConfig === undefined) {
    console.error('tableConfig === undefined');
    return null;
  }

  // Collect the set of columns to fetch.
  let columns = new Set();
  columns.add(tableConfig.primKey);

  if (geoJsonProperty !== undefined && typeof geoJsonProperty === 'string' && geoJsonProperty !== '') {
    if (tableConfig.propertiesById[geoJsonProperty] === undefined) {
      console.error('The specified geoJsonProperty field ' + geoJsonProperty + ' was not found in the table ' + table);
    } else {
      columns.add(geoJsonProperty);
    }
  }

  if (colourProperty !== undefined && typeof colourProperty === 'string' && colourProperty !== '') {
    if (tableConfig.propertiesById[colourProperty] === undefined) {
      console.error('The specified colourProperty field ' + colourProperty + ' was not found in the table ' + table);
    } else {
      columns.add(colourProperty);
    }
  }

  if (labelProperty !== undefined && typeof labelProperty === 'string' && labelProperty !== '') {
    if (tableConfig.propertiesById[labelProperty] === undefined) {
      console.error('The specified labelProperty field ' + labelProperty + ' was not found in the table ' + table);
    } else {
      columns.add(labelProperty);
    }
  }

  return {
    data: {
      method: 'query',
      args: {
        database: config.dataset,
        table,
        columns,
        query,
        transpose: true
      }
    }
  };
});

export default TableGeoJSONsLayer;