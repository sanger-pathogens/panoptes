const React = require('react');
const PureRenderMixin = require('mixins/PureRenderMixin');
const FluxMixin = require('mixins/FluxMixin');
const ConfigMixin = require('mixins/ConfigMixin');
const StoreWatchMixin = require('mixins/StoreWatchMixin');

const SQL = require('panoptes/SQL');

const {RaisedButton} = require('material-ui');
const QueryString = require('panoptes/QueryString');
const QueryEditor = require('panoptes/QueryEditor');

let QueryPicker = React.createClass({
  mixins: [
    PureRenderMixin,
    FluxMixin,
    ConfigMixin,
    StoreWatchMixin('PanoptesStore')],

  propTypes: {
    table: React.PropTypes.string.isRequired,
    onPick: React.PropTypes.func.isRequired,
    initialQuery: React.PropTypes.string
  },

  getStateFromFlux() {
    return {
    }
  },

  getInitialState() {
    return {
      query: SQL.WhereClause.encode(SQL.WhereClause.Trivial())
    }
  },

  componentWillMount() {
    this.config = this.config.tables[this.props.table];
    if (this.props.initialQuery)
      this.setState({query: this.props.initialQuery});
    else {
      let defaultQuery = this.config.defaultQuery;
      if (defaultQuery && defaultQuery != '') {
        this.setState({query: defaultQuery});
      }
    }
  },

  icon() {
    return 'filter';
  },
  title() {
    return `Pick Filter for ${this.config.tableNamePlural}`;
  },

  handlePick() {
    this.props.onPick(this.state.query);
  },

  handleQueryChange(newQuery) {
    this.setState({
      query: newQuery
    });
  },

  render() {
    let {query} = this.state;
    let {table} = this.props;
    return (
      <div className='large-modal'>
        <div className='horizontal stack'>
          <div className='vertical stack'>
            <div className='red grow'>LIST</div>

          </div>
          <div className='vertical stack'>
            <div className='grow scroll-within query-editor-container'>
              <QueryEditor table={table} query={query} onChange={this.handleQueryChange}/>
            </div>
            <div className='centering-container'>
              <QueryString className='text' prepend='' table={table} query={query}/>
            </div>
            <div className='centering-container'>
              <RaisedButton label="Use"
                          primary={true}
                          onClick={this.handlePick}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = QueryPicker;
