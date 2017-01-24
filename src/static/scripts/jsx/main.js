global.jQuery = require('jquery');
import React, { Component } from 'react';
import ControlPointList from './controls';
import ReactDOM from 'react-dom';
import RouteInfoForm from './routeInfoEntry';
import RouteForecastMap from './map';
import ForecastTable from './forecastTable';
import SplitPane from 'react-split-pane';

require('!style!css!bootstrap/dist/css/bootstrap.min.css');
require('!style!css!normalize.css/normalize.css');
require('!style!css!@blueprintjs/core/dist/blueprint.css');
require('!style!css!@blueprintjs/datetime/dist/blueprint-datetime.css');

class RouteWeatherUI extends React.Component {

    constructor(props) {
        super(props);
        this.updateControls = this.updateControls.bind(this);
        this.updateRouteInfo = this.updateRouteInfo.bind(this);
        this.updateForecast = this.updateForecast.bind(this);
        let script = document.getElementById( "routeui" );

        this.state = {controlPoints: [], routeInfo:{bounds:{},points:[], name:''}, forecast:[], action:script.getAttribute('action'),
            maps_key:script.getAttribute('maps_api_key')};
    }

    updateControls(controlPoints) {
        this.setState({controlPoints: controlPoints})
    }

    updateRouteInfo(routeInfo,controlPoints) {
        this.setState({routeInfo:routeInfo,comtrolPoints:controlPoints});
    }

    updateForecast(forecast) {
        this.setState({forecast:forecast['forecast']});
    }

    render() {
        return (
        <div>
            <SplitPane defaultSize={300} minSize={150} maxSize={530} split="horizontal">
                <SplitPane defaultSize={550} minSize={150} split="vertical" pane2Style={{'overflow':'scroll'}}>
                    <RouteInfoForm action={this.state.action}
                                   updateRouteInfo={this.updateRouteInfo}
                                   updateForecast={this.updateForecast}
                                   rwgpsKey={this.state.rwgps_key}
                                   controlPoints={this.state.controlPoints}/>
                    <ControlPointList controlPoints={this.state.controlPoints}
                                      updateControls={this.updateControls}
                                      name={this.state.routeInfo['name']}/>
                </SplitPane>
                <SplitPane defaultSize={500} minSize={150} split="vertical" paneStyle={{'overflow':'scroll'}}>
                    <ForecastTable forecast={this.state.forecast}/>
                    <RouteForecastMap maps_api_key={this.state.maps_key}
                                      forecast={this.state.forecast} routeInfo={this.state.routeInfo}/>
                </SplitPane>
            </SplitPane>
        </div>
      );
    }
}

ReactDOM.render(
  <RouteWeatherUI />,
  document.getElementById('content')
);
