import React from 'react';
import PureRenderMixin from 'mixins/PureRenderMixin';

import 'loading.scss';

let Loading = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    status: React.PropTypes.string.isRequired,
    children: React.PropTypes.any
  },

  render() {
    let {status} = this.props;
    if (status == 'loading')
      return (
        <div className="loading-container show">
          <div className="spinner load-icon" />
        </div>
      );

    if (status == 'loading-hide')
      return (
        <div className="loading-container show hide-content">
          <div className="spinner load-icon" />

        </div>
      );

    if (status == 'error')
      return (
        <div className="loading-container show">
          <div className="error load-icon"/><div className="error-text">{this.props.children}</div>
        </div>
      );

    if (status == 'custom')
      return (
        <div className="loading-container show">
          <div className="custom load-icon">{this.props.children}</div>
        </div>
      );

    return (
      <div className="loading-container">
        <div className="spinner load-icon" />
      </div>
    );

  }

});

module.exports = Loading;
