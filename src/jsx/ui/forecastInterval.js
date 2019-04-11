import React from 'react';
import PropTypes from 'prop-types';
import {Label, Input, FormGroup, UncontrolledTooltip} from 'reactstrap';
import {connect} from 'react-redux';
import {setInterval} from "../actions/actions";
import '../../static/routeInfoEntryStyles.css';

const ForecastInterval = ({interval,setInterval}) => {
    return (
        <div className="routeInfoEntryRowMember">
            <UncontrolledTooltip target='interval' placement='bottom'>How often to generate weather forecast, in hours</UncontrolledTooltip>
            <Label for='interval' size='sm' tag='b' className="intervalLabel">Forecast Interval</Label>
            <Input size="5" bsSize='xsm' id='interval' tabIndex='2' type="number"
                   min={0.5} max={2} step={0.5} name="interval"
                 value={interval} onChange={event => {setInterval(event.target.value)}}/>
        </div>
    );
};

ForecastInterval.propTypes = {
    interval:PropTypes.number.isRequired,
    setInterval:PropTypes.func.isRequired
};

const mapStateToProps = (state) =>
    ({
        interval: state.uiInfo.routeParams.interval
    });

const mapDispatchToProps = {
    setInterval
};

export default connect(mapStateToProps,mapDispatchToProps)(ForecastInterval);