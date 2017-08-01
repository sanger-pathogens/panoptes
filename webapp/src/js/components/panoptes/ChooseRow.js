import React from 'react';

import SQL from 'panoptes/SQL';
import withAPIData from 'hoc/withAPIData';
import _isUndefined from 'lodash/isUndefined';
import templateFieldsUsed from 'util/templateFieldsUsed';
import _uniq from 'lodash/uniq';
import _keys from 'lodash/keys';
import _map from 'lodash/map';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import ItemTemplate from 'panoptes/ItemTemplate';
import FluxMixin from 'mixins/FluxMixin';
import DataItem from 'DataItem';
import DataItemViews from 'panoptes/DataItemViews';

let ChooseRow = React.createClass({

  mixins: [
    FluxMixin,
  ],


  propTypes: {
    query: React.PropTypes.string,
    table: React.PropTypes.string.isRequired,
  },

  getDefaultProps() {
    return {
      query: SQL.nullQuery,
    };
  },

  render() {
    let {data, table, config} = this.props;
    let tableConfig = config.tablesById[table];
    let views = DataItemViews.getViews(tableConfig.dataItemViews, tableConfig.hasGeoCoord);
    let itemTitle = tableConfig.itemTitle || `{{${tableConfig.primKey}}}`;
    if (_isUndefined(data)) {
      return <SelectField hintText="Loading..." disabled={true} >
      </SelectField>;
    } else if (data.length === 0) {
      return <SelectField hintText={`No ${tableConfig.capNamePlural} to choose from`} disabled={true}>
      </SelectField>;
    } else {
      return <SelectField hintText={`Choose a ${tableConfig.capNameSingle}`} onChange={(e,k,v) => {
        this.getFlux().actions.session.popupOpen(<DataItem primKey={v} table={table}>{views}</DataItem>);
      }}>
        {_map(data, (row) =>
          <MenuItem value={row[tableConfig.primKey]} primaryText={
            <ItemTemplate
              table={table}
              primKey={row[tableConfig.primKey]}
              data={row}
              immediate={true}
            >
              {itemTitle}
            </ItemTemplate>

          }/>)}
      </SelectField>;
    }
  }
});

ChooseRow = withAPIData(ChooseRow, ({config, props}) => {
  let {table, query} = props;
  let tableConfig = config.tablesById[table];
  let itemTitle = tableConfig.itemTitle || `{{${tableConfig.primKey}}}`;
  let columns = templateFieldsUsed(itemTitle, _keys(tableConfig.propertiesById));
  columns.push(tableConfig.primKey);
  columns = _uniq(columns);

  return ({
    data: {
      method: 'query',
      args: {
        database: config.dataset,
        table: table,
        columns: columns,
        query: query,
        transpose: true
      }
    }
  });
});

export default ChooseRow;
