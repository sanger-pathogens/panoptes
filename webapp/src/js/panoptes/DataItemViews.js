import React from 'react';
import Overview from 'Overview/Widget';
import TableMap from 'Map/Table/Widget';
import PieChartMap from 'Map/Chart/Pie/Widget';
import FieldList from 'FieldList/Widget';
import PropertyGroup from 'PropertyGroup/Widget';
import Template from 'Template/Widget';

function getViews(dataItemViews, hasGeoCoord) {
  /*eslint-disable react/display-name */
  //TODO: deprecate ItemMap for TableMap
  const viewTypes = {
    Overview: (dataItemView, key) => (<Overview title="Overview" key={key}/>),
    PieChartMap: (dataItemView, key) => (<PieChartMap
      initCenter={[dataItemView.mapCenter.latitude, dataItemView.mapCenter.longitude]}
      componentColumns={dataItemView.componentColumns}
      locationDataTable={dataItemView.locationDataTable}
      locationNameProperty={dataItemView.locationNameProperty}
      locationSizeProperty={dataItemView.locationSizeProperty}
      title={dataItemView.name}
      residualFractionName={dataItemView.residualFractionName}
      key={key} />),
    ItemMap: (dataItemView, key) => (<TableMap title={dataItemView.name} key={key} />),
    TableMap: (dataItemView, key) => (<TableMap title={dataItemView.name} key={key} />),
    FieldList: (dataItemView, key) => (<FieldList title={dataItemView.name} fields={dataItemView.fields} key={key} />),
    PropertyGroup: (dataItemView, key) => (<PropertyGroup
      title={dataItemView.name || dataItemView.groupId} //TODO This should be name from group config
      propertyGroupId={dataItemView.groupId}
      key={key} />),
    Template: (dataItemView, key) => (<Template
      title={dataItemView.name}
      content={dataItemView.content}
      key={key} />)
  };
  /*eslint-enable react/display-name */

  const views = [];
  if (dataItemViews === undefined || dataItemViews === null) {
    // If there are no dataItemViews specified, then default to showing an Overview.
    views.push(<Overview title="Overview" />);
    if (hasGeoCoord) {
      // If there are no dataItemViews specified and this table hasGeoCoord, then default to showing a Map
      views.push(<TableMap title="Location" />);
    }
  } else {
    dataItemViews.forEach((dataItemView, i) => {
      // Compose a tabPane for each of the specified dataItemViews
      if (viewTypes[dataItemView.type])
        views.push(viewTypes[dataItemView.type](dataItemView, i));
    });
  }
  return views;
}

module.exports = {
  getViews
};