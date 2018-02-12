import {Alert, Button, ButtonGroup, ButtonToolbar, Checkbox, Glyphicon, Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import MediaQuery from 'react-responsive';
import ControlTable from './controlTable';
import {Spinner} from '@blueprintjs/core';
import ErrorBoundary from './errorBoundary';
import PropTypes from 'prop-types';
import {
    addControl,
    beginStravaFetch,
    setActualPace,
    setStravaError,
    stravaFetchSuccess,
    toggleDisplayBanked,
    toggleMetric,
    toggleStravaAnalysis,
    updateCalculatedValues
} from './actions/actions';
import {connect} from 'react-redux';
import FinishTime from './finishTime';
import StravaRoute from './stravaRoute';

class ControlPoints extends Component {

    static propTypes = {
        metric: PropTypes.bool.isRequired,
        strava_token: PropTypes.string,
        controlPoints: PropTypes.arrayOf(PropTypes.object).isRequired,
        finishTime: PropTypes.string.isRequired,
        strava_error: PropTypes.string,
        setActualPace:PropTypes.func.isRequired,
        strava_activity:PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.oneOf([' '])
        ]),
        actualFinishTime:PropTypes.string,
        updateControls:PropTypes.func.isRequired,
        forecastValid:PropTypes.bool.isRequired,
        name:PropTypes.string,
        stravaToken:PropTypes.string,
        beginStravaFetch:PropTypes.func.isRequired,
        addControl:PropTypes.func.isRequired,
        setStravaError:PropTypes.func.isRequired,
        stravaFetchSuccess:PropTypes.func.isRequired,
        toggleStravaAnalysis:PropTypes.func.isRequired,
        toggleMetric:PropTypes.func.isRequired,
        displayBanked:PropTypes.bool.isRequired,
        fetchingFromStrava:PropTypes.bool,
        toggleDisplayBanked:PropTypes.func.isRequired,
        stravaAnalysis: PropTypes.bool.isRequired
    };

    static contextTypes = {
        store: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.addControl = this.addControl.bind(this);
        this.updateExpectedTimes = this.updateExpectedTimes.bind(this);
        this.stravaErrorCallback = this.stravaErrorCallback.bind(this);
        this.hideStravaErrorAlert = this.hideStravaErrorAlert.bind(this);
        this.changeDisplayFinishTime = this.changeDisplayFinishTime.bind(this);
        this.computeTimesFromStrava = this.computeTimesFromStrava.bind(this);
        this.state = {
            lookback:this.props.strava_activity!==undefined,
            stravaAlertVisible: false, stravaError: this.props.strava_error, displayedFinishTime:this.props.finishTime,
            strava_activity: this.props.strava_activity===undefined?' ':this.props.strava_activity
        };
    }

    static showProgressSpinner(running) {
        if (running) {
            return (
                <Spinner/>
            );
        }
    }

    changeDisplayFinishTime(event) {
        if (event.type === 'mouseenter' && this.props.actualFinishTime !== undefined) {
            this.setState({displayedFinishTime:this.props.actualFinishTime});
        }
        if (event.type === 'mouseleave') {
            this.setState({displayedFinishTime:this.props.finishTime});
        }
    }

    hideStravaErrorAlert() {
        this.setState({stravaError:null, stravaAlertVisible:false});
    }

    stravaErrorCallback(error) {
        this.props.setStravaError(error);
        this.setState({stravaError:error,stravaAlertVisible:true});
    }

    static async getStravaParser() {
        const parser = await import(/* webpackChunkName: "StravaRouteParser" */ './stravaRouteParser');
        return parser.default;
    }

    async computeTimesFromStrava(activity, controlPoints) {
        const stravaParser = await ControlPoints.getStravaParser();
        stravaParser.computeActualTimes(activity, controlPoints, this.props.stravaToken,
            this.props.beginStravaFetch, this.props.stravaFetchSuccess).then( result => {
                this.props.updateControls(result.controls);
                this.props.setActualFinishTime(result.actualFinishTime);
                this.props.setActualPace(result.actualPace);
            },
            error => this.stravaErrorCallback(error));
    }

    updateExpectedTimes(value) {
        let newValue = parseInt(value,10);
        if (isNaN(newValue)) {
            return;
        }
        this.computeTimesFromStrava(newValue,this.props.controlPoints);
    }

    componentWillReceiveProps(newProps) {
/*
        if (newProps.strava_activity !== undefined && newProps.strava_activity !== '') {
            this.setState({strava_activity:newProps.strava_activity});
            this.computeTimesFromStrava(newProps.strava_activity, newProps.controlPoints);
        }
*/
        if (newProps.strava_error !== undefined) {
            this.setState({stravaError:newProps.strava_error});
        }
        if (newProps.finishTime !== this.props.finishTime) {
            this.setState({'displayedFinishTime':newProps.finishTime});
        }
    }

    addControl( ) {
        this.props.addControl();
    }

    render () {
        const title = this.props.name === '' ?
            ( <h3 style={{textAlign:"center"}}>Control point list</h3> ) :
            ( <h3 style={{textAlign:"center"}}>Control point list for <i>{this.props.name}</i></h3> );
        return (
            <div className="controlPoints">
                <ButtonToolbar style={{display:'inline-flex',flexDirection:'row', paddingTop:'11px',paddingLeft:'4px'}}>
                {/*<ButtonGroup style={{display:'flex',flexFlow:'row wrap'}}>*/}
                    <ButtonGroup>
                        <Button tabIndex='10' onClick={this.addControl} id='addButton'><Glyphicon glyph="plus-sign"/>Add control point</Button>
                        <FinishTime/>
                        <Checkbox tabIndex='12' checked={this.props.metric} inline
                                  onClick={this.props.toggleMetric}
                                  style={{padding:'0px 0px 0px 26px',display:'inline-flex'}}>metric</Checkbox>
                        <Checkbox tabIndex='11' checked={this.props.displayBanked} inline
                                   onClick={this.props.toggleDisplayBanked}
                                  style={{padding:'0px 0px 0px 24px', display:'inline-flex'}}>Display banked time</Checkbox>
                        <Checkbox tabIndex="13" checked={this.props.stravaAnalysis} disabled={!this.props.forecastValid} inline
                                  onClick={this.props.toggleStravaAnalysis} style={{display:'inline-flex'}}>Compare</Checkbox>
                        <ErrorBoundary>
                            <StravaRoute/>
                            {this.state.stravaAlertVisible?<Alert onDismiss={this.hideStravaErrorAlert} bsStyle='warning'>{this.state.stravaError}</Alert>:null}
                            {ControlPoints.showProgressSpinner(this.props.fetchingFromStrava)}
                        </ErrorBoundary>
                    </ButtonGroup>
                </ButtonToolbar>

                <ErrorBoundary>
                    <MediaQuery minDeviceWidth={1000}>
                        <Panel header={title} bsStyle="info" style={{margin:'10px'}}>
                            <ErrorBoundary>
                                <ControlTable/>
                            </ErrorBoundary>
                        </Panel>
                    </MediaQuery>
                    <MediaQuery maxDeviceWidth={800}>
                                <ControlTable/>
                    </MediaQuery>
                </ErrorBoundary>
                <div tabIndex="98" onFocus={() => {document.getElementById('addButton').focus()}}/>
            </div>
        );
    }
}

const mapStateToProps = (state) =>
    ({
        metric: state.controls.metric,
        controlPoints: state.controls.userControlPoints,
        calculatedValues: state.controls.calculatedValues,
        finishTime: state.routeInfo.finishTime,
        name: state.routeInfo.name,
        stravaToken: state.strava.token,
        strava_error: state.strava.error,
        strava_activity: state.strava.activity,
        displayBanked: state.controls.displayBanked,
        stravaAnalysis: state.controls.stravaAnalysis,
        fetchingFromStrava: state.strava.fetching,
        forecastValid: state.forecast.valid
    });

const mapDispatchToProps = {
    updateControls:updateCalculatedValues, toggleMetric, setStravaError, beginStravaFetch,
    toggleDisplayBanked, stravaFetchSuccess, toggleStravaAnalysis, setActualPace, addControl
};

export default connect(mapStateToProps, mapDispatchToProps)(ControlPoints);
