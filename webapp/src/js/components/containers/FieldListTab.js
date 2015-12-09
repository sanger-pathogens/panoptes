const React = require('react');
const Immutable = require('immutable');
const ImmutablePropTypes = require('react-immutable-proptypes');
const shallowEquals = require('shallow-equals');

// Mixins
const PureRenderMixin = require('mixins/PureRenderMixin');
const FluxMixin = require('mixins/FluxMixin');
const ConfigMixin = require('mixins/ConfigMixin');
const DataFetcherMixin = require('mixins/DataFetcherMixin');

// Panoptes components
const API = require('panoptes/API');
const PropertyList = require('panoptes/PropertyList');

// UI components
const Loading = require('ui/Loading');

let FieldListTab = React.createClass({
  
  mixins: [
    PureRenderMixin,
    FluxMixin,
    ConfigMixin,
    DataFetcherMixin('table', 'primKey')
  ],
  
  propTypes: {
    title: React.PropTypes.string,
    table: React.PropTypes.string.isRequired,
    primKey: React.PropTypes.string.isRequired
  },
  
  getInitialState() {
    return {
      loadStatus: 'loaded'
    };
  },
  
  fetchData(props) {
    let {table, primKey} = props;
    this.setState({loadStatus: 'loading'});
    API.fetchSingleRecord({
      database: this.config.dataset,
      table: table,
      primKeyField: this.config.tables[table].primkey,
      primKeyValue: primKey}
    )
      .then((data) => {
        if (shallowEquals(props, this.props)) {
          this.setState({loadStatus: 'loaded', data: data});
        }
      })
        .catch((error) => {
          ErrorReport(this.getFlux(), error.message, () => this.fetchData(props));
          this.setState({loadStatus: 'error'});
        });
  },
  
  title() {
    return this.props.title;
  },
  
  render()
  {
    let {table, primKey, fields} = this.props;
    let {data, loadStatus} = this.state;
    
    if (! data) return null;
    
    let propertiesDataIndexes = {};
    
    // Make a clone of the propertiesData, which will be augmented.
    let propertiesData = _.cloneDeep(this.config.tables[table].properties);
    
    for (let i = 0; i < propertiesData.length; i++)
    {
      // Augment the array element (an object) with the fetched value of the property.
      propertiesData[i].value = data[propertiesData[i].propid];
      
      // Record which array index in propertiesData relates to which property Id.
      propertiesDataIndexes[propertiesData[i].propid] = i;
    }
    
    // Collect the propertiesData for the specified list of fields.
    let fieldListPropertiesData = [];
    for (let j = 0; j < fields.length; j++)
    {
      let propertiesDataIndex = propertiesDataIndexes[fields[j]];
      if (typeof propertiesDataIndex !== 'undefined')
      {
        fieldListPropertiesData.push(propertiesData[propertiesDataIndex]);
      }
      else
      {
        console.log("Foreign property: " + fields[j]);
      }
    }
    
    
    return (
        <div>
          <PropertyList propertiesData={fieldListPropertiesData} className='table-col' />
          <Loading status={loadStatus}/>
        </div>
    );
  }

});

module.exports = FieldListTab;
