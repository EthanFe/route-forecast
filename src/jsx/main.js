import React, {Component} from 'react';
import ControlPoints from './controls';
import RouteInfoForm from './routeInfoEntry';
import RouteForecastMap from './map';
import ForecastTable from './forecastTable';
import SplitPane from 'react-split-pane';
import MediaQuery from 'react-responsive';
// for react-splitter
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-fresh.css';
import 'flatpickr/dist/themes/confetti.css';
import 'Images/style.css';
import {Button} from 'reactstrap';
import queryString from 'query-string';
import ErrorBoundary from './errorBoundary';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// import cookie from 'react-cookies';
import {
    setActionUrl,
    setApiKeys,
    setFetchAfterLoad,
    setInterval,
    setMetric,
    setPace,
    setRwgpsRoute,
    setStart,
    setStravaActivity,
    setStravaError,
    setStravaToken,
    showForm,
    updateUserControls,
    loadCookie,
    saveCookie,
    toggleStravaAnalysis,
    loadFromRideWithGps,
    reset,
    newUserMode
} from "./actions/actions";
import QueryString from './queryString';
import PaceTable from './paceTable';

const demoRoute = 1797453;
const demoControls = [
    {
        "name": "Petaluma",
        "distance": 43.7,
        "duration": 20,
        "id": 0
    },
    {
        "name": "Valley Ford",
        "distance": 62.2,
        "duration": 20,
        "id": 1
    },
    {
        "name": "Point Reyes Station",
        "distance": 87.8,
        "duration": 20,
        "id": 2
    }
];
export class RouteWeatherUI extends Component {
    static propTypes = {
        setActionUrl:PropTypes.func.isRequired,
        setApiKeys:PropTypes.func.isRequired,
        updateControls:PropTypes.func.isRequired,
        formVisible:PropTypes.bool.isRequired,
        showForm:PropTypes.func.isRequired,
        showPacePerTme:PropTypes.bool.isRequired,
        setFetchAfterLoad:PropTypes.func.isRequired,
        toggleStravaAnalysis: PropTypes.func.isRequired,
        loadFromRideWithGps: PropTypes.func.isRequired,
        rwgpsRouteIsTrip: PropTypes.bool.isRequired,
        reset: PropTypes.func.isRequired,
        firstUse: PropTypes.bool.isRequired,
        newUserMode: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.formatControlsForUrl = this.formatControlsForUrl.bind(this);

        const newUserMode = RouteWeatherUI.isNewUserMode();
        this.props.newUserMode(newUserMode);
        let queryParams = queryString.parse(location.search);
        RouteWeatherUI.updateFromQueryParams(this.props, queryParams);
        let script = document.getElementById( "routeui" );
        props.setActionUrl(script.getAttribute('action'));
        props.setApiKeys(script.getAttribute('maps_api_key'),script.getAttribute('timezone_api_key'));
        this.props.updateControls(queryParams.controlPoints===undefined?[]:this.parseControls(queryParams.controlPoints));
        if (newUserMode) {
            RouteWeatherUI.loadCannedData(this.props);
        }
        this.state = {};
    }

    static getStravaToken(queryParams) {
        if (queryParams.strava_token !== undefined) {
            saveCookie('strava_token', queryParams.strava_token);
            return queryParams.strava_token;
        } else {
            return loadCookie('strava_token');
        }
    }

    static formatOneControl(controlPoint) {
        if (typeof controlPoint === 'string') {
            return controlPoint;
        }
        return controlPoint.name + "," + controlPoint.distance + "," + controlPoint.duration;
    }

    formatControlsForUrl(controlPoints) {
        return controlPoints.reduce((queryParam,point) => {return RouteWeatherUI.formatOneControl(queryParam) + ':' + RouteWeatherUI.formatOneControl(point)},'');
    }

    static isNewUserMode() {
        return false;
        // return (location.search === '' && cookie.load('initialized') === undefined);
    }

    static loadCannedData(props) {
        props.setRwgpsRoute(demoRoute);
        props.setFetchAfterLoad(true);
        props.updateControls(demoControls);
    }

    parseControls(controlPointString) {
        let controlPointList = controlPointString.split(":");
        let controlPoints =
        controlPointList.map((point,index) => {
            let controlPointValues = point.split(",");
            return ({name:controlPointValues[0],distance:Number(controlPointValues[1]),duration:Number(controlPointValues[2]), id:index});
            });
        // delete dummy first element
        controlPoints.splice(0,1);
        return controlPoints;
    }

    static updateFromQueryParams(props, queryParams) {
        props.setRwgpsRoute(queryParams.rwgpsRoute);
        // force forecast fetch when our initial url contains a route number
        if (queryParams.rwgpsRoute !== undefined) {
            props.setFetchAfterLoad(true);
        }
        props.setStravaToken(RouteWeatherUI.getStravaToken(queryParams));
        props.setStart(queryParams.start);
        props.setPace(queryParams.pace);
        props.setInterval(queryParams.interval);
        props.setMetric(queryParams.metric==="true");
        props.setStravaActivity(queryParams.strava_activity);
        props.setStravaError(queryParams.strava_error);
        if (queryParams.strava_analysis !== undefined) {
            props.toggleStravaAnalysis();
        }
    }

    componentDidMount() {
        window.onpopstate = (event) => {
            if (event.state === null) {
                this.props.reset();
            } else {
                RouteWeatherUI.updateFromQueryParams(this.props, event.state);
                if (event.state.rwgpsRoute !== undefined) {
                    this.props.loadFromRideWithGps(event.state.rwgpsRoute,this.props.rwgpsRouteIsTrip);
                }
            }
        }
    }

    render() {
        const inputForm = (
            <ErrorBoundary>
                <RouteInfoForm formatControlsForUrl={this.formatControlsForUrl}/>
            </ErrorBoundary>
        );
        const formButton = (
            <Button color="primary" onClick={this.props.showForm}>Modify...</Button>
        );
        return (
        <div>
            <QueryString/>
            <MediaQuery minDeviceWidth={1000}>
                <SplitPane defaultSize={300} minSize={150} maxSize={530} split="horizontal">
                    <SplitPane defaultSize={550} minSize={150} split='vertical' pane2Style={{'overflow':'scroll'}}>
                        {inputForm}
                        <ErrorBoundary>
                            <ControlPoints/>
                        </ErrorBoundary>
                    </SplitPane>
                        <SplitPane defaultSize={545} minSize={150} split="vertical" paneStyle={{'overflow':'scroll'}}>
                            {this.props.showPacePerTme?<PaceTable/>:<ForecastTable/>}
                            <RouteForecastMap/>
                        </SplitPane>
                </SplitPane>
            </MediaQuery>
            <MediaQuery maxDeviceWidth={800}>
                <SplitPane defaultSize={this.props.formVisible?410:50} minSize={this.props.formVisible?120:20} maxSize={600} split="horizontal" pane2Style={{'overflow':'scroll'}}>
                    {this.props.formVisible ? inputForm : formButton}
                    {!this.props.formVisible? <ForecastTable/>: <div/>}
                </SplitPane>
            </MediaQuery>
        </div>
      );
    }
}

const mapDispatchToProps = {
    setStravaToken, setActionUrl, setRwgpsRoute, setApiKeys, setStravaError, setStart, setPace, setInterval, setMetric,
    setStravaActivity, updateControls:updateUserControls, showForm, setFetchAfterLoad, toggleStravaAnalysis,
    loadFromRideWithGps, reset, newUserMode
};

const mapStateToProps = (state) =>
    ({
        formVisible: state.uiInfo.dialogParams.formVisible,
        showPacePerTme:state.controls.stravaAnalysis && state.strava.calculatedPaces !== null,
        rwgpsRouteIsTrip: state.uiInfo.routeParams.rwgpsRouteIsTrip,
        firstUse: state.params.newUserMode
    });

export default connect(mapStateToProps, mapDispatchToProps)(RouteWeatherUI);
