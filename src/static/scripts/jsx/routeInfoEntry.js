const FormGroup = require('react-bootstrap').FormGroup,
FormControl = require('react-bootstrap').FormControl,
Form = require('react-bootstrap').Form;//,
ControlLabel = require('react-bootstrap').ControlLabel,
Button = require('react-bootstrap').Button,
HelpBlock = require('react-bootstrap').HelpBlock,
Tooltip = require('react-bootstrap').Tooltip,
OverlayTrigger = require('react-bootstrap').OverlayTrigger,
React = require('react'),
moment = require("moment"),
Glyphicon = require('react-bootstrap').Glyphicon,
Alert = require('react-bootstrap').Alert,
LoginDialog = require('./loginDialog'),
DateTimePicker = require("@blueprintjs/datetime").DateTimePicker,
Position = require("@blueprintjs/core").Position,
Popover = require("@blueprintjs/core").Popover;

const paceToSpeed = {'A':10, 'B':12, 'C':14, 'C+':15, 'D-':15, 'D':16, 'D+':17, 'E-':17, 'E':18};

const time_tooltip = (
    <Tooltip id="time_tooltip">When you plan to begin riding</Tooltip>
);

const interval_tooltip = (
    <Tooltip id="interval_tooltip">How often to generate weather forecast</Tooltip>
);

const rwgps_disabled_tooltip = (
    <Tooltip id="pace_tooltip" placement="bottom" positionLeft="0">Must log into rideWithGps to enable</Tooltip>
);

const rwgps_enabled_tooltip = (
    <Tooltip id="pace_tooltip" positionLeft="0">The number for a route on ridewithgps</Tooltip>
);

const forecast_disabled_tooltip = (
        <Tooltip id="forecast_tooltip">Must either upload a gpx file or provide an rwgps route id</Tooltip> );

const forecast_enabled_tooltip = (<Tooltip id="'forecast_en">Request a ride forecast</Tooltip>)

const startHour = 7;

class RouteInfoForm extends React.Component {

    constructor(props) {
        super(props);
        this.loginResult = this.loginResult.bind(this);
        this.forecastCb = this.forecastCb.bind(this);
        this.requestForecast = this.requestForecast.bind(this);
        this.disableSubmit = this.disableSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.intervalChanged = this.intervalChanged.bind(this);
        this.state = {start:this.findNextStartTime(), pace:'D', interval:1, rwgps_enabled:false,
            xmlhttp : null, routeFileSet:false,rwgpsRoute:false,errorDetails:null,
            pending:false};
    }


    findNextStartTime() {
        let now = new Date();
        if (now.getHours() > startHour) {
            now.setDate(now.getDate() + 1);
            now.setHours(startHour);
            now.setMinutes(0);
        }
        return now;
    }

    loginResult(result) {
        this.setState({rwgps_enabled : true});
    }

    requestForecast(event) {
        this.state.xmlhttp = new XMLHttpRequest();
        this.state.xmlhttp.onreadystatechange = this.forecastCb;
        this.state.xmlhttp.responseType = 'json';
        let requestForm = document.getElementById("forecast_form");
        let formdata = new FormData(requestForm);
        this.state.xmlhttp.open("POST", this.props.action);
        formdata.append('starting_time',moment(this.state.start).format('YYYY-MM-DDTHH:mm'));
        if (this.props.controlPoints.length > 0) {
            let js = JSON.stringify(this.props.controlPoints);
            formdata.set("controls",js);
        }
        this.state.xmlhttp.send(formdata);
        this.setState({pending:true});
    }

    forecastCb(event) {
        if (this.state.xmlhttp.readyState == 4) {
            this.setState({pending:false});
            if (event.target.status==200) {
                this.setState({errorDetails:null});
                this.props.updateForecast(event.target.response);
            }
            else {
                if (event.target.response != null) {
                    this.setState({errorDetails:event.target.response['status']});
                }
                else if (event.target.statusText != null) {
                    this.setState({errorDetails:event.target.statusText});
                }
            }
        }
    }

    disableSubmit() {
        return !this.state.rwgpsRoute && !this.state.routeFileSet;
    }

    intervalChanged(event) {
        if (event.target.value != '') {
            this.setState({interval:event.target.value});
        }
    }

    handleDateChange(time) {
        this.setState({start:time});
    }

    showErrorDetails(errorState) {
        if (errorState != null) {
            return (
                <Alert bsStyle="danger">{errorState}</Alert>
            );
        }
    }

    render() {
        let pace_mph = paceToSpeed[this.state.pace];
        let pace_text = "Represents elevation-adjusted pace - current is ".concat(pace_mph);
        let pace_tooltip = ( <Tooltip id="pace_tooltip">{pace_text}</Tooltip> );
        let forecast_tooltip = this.disableSubmit() ? (
            <Tooltip id="forecast_tooltip">Must either upload a gpx file or provide an rwgps route id</Tooltip> ):
            (<Tooltip id="'forecast_tooltip">Request a ride forecast</Tooltip>);
        const now = new Date();
        let later = new Date();
        const daysToAdd = 14;
        later.setDate(now.getDate() + daysToAdd);
        let timeProps = {showArrowButtons:true};
        let dateProps = {minDate:now,maxDate:later,canClearSelection:false};
        let buttonStyle = this.disableSubmit() ? {pointerEvents : 'none'} : {};
        let popupCalendar = (
            <FormGroup controlId="starting_time">
                <ControlLabel>Starting time</ControlLabel>
                <DateTimePicker name="starting_time" value={this.state.start}
                                onChange={this.handleDateChange}
                                datePickerProps={dateProps}
                                timePickerProps={timeProps}
                                placeholder="Select Date.."/>

            </FormGroup>
        );
        return (
            <div>
                <Form id="forecast_form">
                    <Popover content={popupCalendar} position={Position.BOTTOM} useSmartPositioning={true}
                             popoverClassName="pt-popover-content-sizing">
                        <Button><Glyphicon glyph="calendar"></Glyphicon>Starting time</Button>
                    </Popover>
{/*
                        <FormGroup controlId="starting_time">
                            <ControlLabel>Starting time</ControlLabel>
                            <DateTimePicker name="starting_time" value={this.state.start}
                                            onChange={this.handleDateChange}
                                            datePickerProps={dateProps}
                                            timePickerProps={timeProps}
                                            placeholder="Select Date.."/>

                        </FormGroup>
*/}
                    <OverlayTrigger placement='bottom' overlay={time_tooltip}>
                        <FormGroup controlId="starting_time_display">
                            <FormControl type="text" readOnly style={{'width':'60%'}}
                                         value={moment(this.state.start).format('dddd, MMMM Do, YYYY h:mmA ')}/>
                        </FormGroup>
                    </OverlayTrigger>
                    <OverlayTrigger placement='bottom' overlay={interval_tooltip}>
                        <FormGroup bsSize='small' controlId="interval">
                            <ControlLabel>Interval in hours</ControlLabel>
                            <FormControl type="number" min={0.5} max={2} step={0.5} name="interval" style={{'width':'4em'}}
                                         value={this.state.interval} onChange={this.intervalChanged}/><br />
                         </FormGroup>
                    </OverlayTrigger>
                    <OverlayTrigger placement="bottom" overlay={pace_tooltip}>
                        <FormGroup controlId="pace">
                            <ControlLabel>Pace</ControlLabel>
                            <FormControl componentClass="select" value={this.state.pace} name="pace" style={{'width':'3em'}}
                                         onChange={event => this.setState({start:this.state.start,pace:event.target.value})}
                                         required>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="C+">C+</option>
                                <option value="D-">D-</option>
                                <option value="D">D</option>
                                <option value="D+">D+</option>
                                <option value="E-">E-</option>
                                <option value="E">E</option>
                            </FormControl>
                        </FormGroup>
                    </OverlayTrigger>
                    <a href="https://westernwheelersbicycleclub.wildapricot.org/page-1374754" target="_blank">Pace explanation</a>
                    <HelpBlock>Upload a .gpx file describing your route</HelpBlock>
                    <FormGroup controlId="route">
                        <ControlLabel>Route file:</ControlLabel>
                        <FormControl type="file" name='route' accept=".gpx"
                                     onChange={event => this.setState({routeFileSet : event.target.value != ''})}/>
                    </FormGroup>
                    <OverlayTrigger placement="bottom" overlay={this.state.rwgps_enabled?rwgps_enabled_tooltip:rwgps_disabled_tooltip}>
                        <FormGroup controlId="ridewithgps">
                        <ControlLabel>RideWithGps route number</ControlLabel>
                        <FormControl type="number" pattern="[0-9]*"
                                     onChange={event => this.setState({rwgpsRoute : event.target.value!=''})}
                                     style={{'width':'4em'}}
                                     disabled={!this.state.rwgps_enabled}/>
                        </FormGroup>
                    </OverlayTrigger>
                    <OverlayTrigger placement='bottom' overlay={forecast_tooltip}>
                        <div style={{'display':'inline-block'}} cursor='not-allowed'>
                            <Button bsStyle="primary" onClick={this.requestForecast}
                                    style={buttonStyle}
                                    disabled={this.disableSubmit() || this.state.pending} bsSize="large">
                                {this.state.pending?'Updating...':'Find forecast'}</Button>
                        </div>
                    </OverlayTrigger>
                    {this.showErrorDetails(this.state.errorDetails)}
                </Form>
                <LoginDialog loginCb={this.loginResult}/>
            </div>
        );
    }
}

module.exports=RouteInfoForm;