import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import API from 'panoptes/API';
import LRUCache from 'util/LRUCache';
import ErrorReport from 'panoptes/ErrorReporter';
import HTMLWithComponents from 'panoptes/HTMLWithComponents';
import EditDocPage from 'panoptes/EditDocPage';
import htmlparser from 'htmlparser2';
import Loading from 'ui/Loading';
import IconButton from '@material-ui/core/IconButton';
import customHandlebars from 'util/customHandlebars';
import _isFunction from 'lodash.isfunction';

// Mixins
import ConfigMixin from 'mixins/ConfigMixin';
import PureRenderMixin from 'mixins/PureRenderMixin';
import FluxMixin from 'mixins/FluxMixin';
import DataFetcherMixin from 'mixins/DataFetcherMixin';

let DocPage = createReactClass({
  displayName: 'DocPage',

  mixins: [
    ConfigMixin,
    PureRenderMixin,
    FluxMixin,
    DataFetcherMixin()
  ],

  getInitialState() {
    return {
      content: '',
      loadStatus: 'loading'
    };
  },

  propTypes: {
    path: PropTypes.string,
    replaceSelf: PropTypes.func,
    updateTitleIcon: PropTypes.func,
    resetScroll: PropTypes.func,
    replaceable: PropTypes.bool,
    dynamicSize: PropTypes.bool,
    setProps: PropTypes.func,
  },

  getDefaultProps() {
    return {
      setProps: null,
      replaceable: true
    };
  },

  componentWillMount() {
    this.titleFromHTML = 'Loading...';
    this.handlebars = customHandlebars(this.config);
    if (this.props.resetScroll) this.props.resetScroll();
  },

  onConfigChange() {
    const {path, replaceSelf, updateTitleIcon, replaceable, ...other} = this.props;
    this.handlebars = customHandlebars(this.config);
    if (this.config.docs[path]) {
      this.handlebars.compile(this.config.docs[path])({config: this.config})
        .then((rendered) =>
          this.setState({
            loadStatus: 'loaded',
            content: rendered
          }, () => this.componentWillUpdate(this.props, this.state)));
    }
  },

  fetchData(props, requestContext) {
    const {path, replaceSelf, updateTitleIcon, replaceable, ...other} = props;
    if (path !== this.props.path) {
      this.titleFromHTML = 'Loading...';
      this.setState(this.getInitialState());
    }
    if (this.config.docs[path]) {
      this.handlebars.compile(this.config.docs[path])({config: this.config, ...other})
        .then((rendered) => this.setState({
          loadStatus: 'loaded',
          content: rendered
        }, () => this.componentWillUpdate(props, this.state)));
      return;
    }
    const {dataset} = this.config;
    requestContext.request((componentCancellation) =>
      LRUCache.get(
        `staticContent${path}`,
        (cacheCancellation) =>
          API.staticContent({cancellation: cacheCancellation, url: `/panoptes/Docs/${dataset}/${path}`}),
        componentCancellation
      )
    )
      .catch(API.filterAborted)
      .catch(LRUCache.filterCancelled)
      .then((content) => this.handlebars.compile(content)({config: this.config, ...other}))
      .then((rendered) => this.setState({
        loadStatus: 'loaded',
        content: rendered
      }))
      .catch((error) => {
        this.setState({loadStatus: 'error', content: error.statusText});
        ErrorReport(this.getFlux(), error.statusText, () => this.fetchData(this.props, requestContext));
        console.error(error);
        throw error;
      })
      .done();
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.props.resetScroll & nextState.content !== this.state.content) {
      this.props.resetScroll();
    }
    let inTitle = false;
    let title = 'Untitled';
    const parser = new htmlparser.Parser({
      onopentag(tagname, attribs) {
        if (tagname === 'title') {
          inTitle = true;
        }
      },
      ontext(text) {
        if (inTitle) {
          title = text;
        }
      },
      onclosetag(tagname) {
        if (tagname === 'title') {
          inTitle = false;
        }
      }
    }, {decodeEntities: true});
    parser.write(nextState.content);
    parser.end();
    if (title !== this.titleFromHTML) {
      this.titleFromHTML = title;
      if (nextProps.updateTitleIcon) {
        nextProps.updateTitleIcon();
      }
    }
  },

  title() {
    return this.titleFromHTML;
  },

  icon() {
    return 'file-alt';
  },

  render() {
    const {path, dynamicSize} = this.props;
    const {content, loadStatus} = this.state;
    const replaceSelf = this.props.replaceable ? this.props.replaceSelf : undefined;
    const actions = this.getFlux().actions;
    // NOTE: z-index of the Edit modal is currently set to 9997.
    const editButtonZIndex = 9996;
    return <div className={dynamicSize ? '' : 'load-container'}>
      <HTMLWithComponents className="doc-page" replaceSelf={replaceSelf}>{content}</HTMLWithComponents>
      {this.config.user.isManager ?
        <div className="docpage-edit"  style={{zIndex: editButtonZIndex}}>
          <IconButton
            aria-label="Edit"
            className="fa fa-edit"
            onClick={() => actions.session.modalOpen(<EditDocPage path={path}/>)}
          />
        </div>
        : null}
      <Loading status={loadStatus}>{content}</Loading>
    </div>;
  },
});

export default DocPage;
