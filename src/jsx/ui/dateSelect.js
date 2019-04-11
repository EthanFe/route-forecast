import React from 'react';
import PropTypes from 'prop-types';
import Flatpickr from 'react-flatpickr'
import {Icon} from '@blueprintjs/core';
import {Label, FormGroup, UncontrolledTooltip} from 'reactstrap';
import {connect} from 'react-redux';
import {setStart} from "../actions/actions";
import '../../static/routeInfoEntryStyles.css';

/*const setDateAndTime = function(dates, datestr, instance) {
    if (datestr === '') {
        instance.setDate(this.props.start);
        return;
    }
    this.props.setStart(new Date(dates[0]));
};*/

const DateSelect = ({start,setStart}) => {
    // allow us to continue to show the start time if the route was forecast for a time before the present
    const now = new Date();
    let firstDate = now > start ? start : now;
    let later = new Date();
    const daysToAdd = 14;
    later.setDate(now.getDate() + daysToAdd);

    return (
        <FormGroup size='sm' tabIndex="1"
                   style={{flex:'1',display:'inline-flex',alignItems:'center'}} id="dateEntryContainer" className="dateEntryContainer">
            <UncontrolledTooltip placement='bottom' target="dateEntryContainer">When you plan to begin riding</UncontrolledTooltip>
            <div className="dateEntryLabelContainer">
                <Icon icon="calendar" className="calendarIcon"/>
                <Label for='calendar' tag='b' id='startingTime' className="dateEntryLabel">Starting Time</Label>
            </div>
            <Flatpickr key={start.getTime()} id='calendar' onChange={(dates) => {
                setStart(new Date(dates[0]));
            }}
                       options={{enableTime: true,
                           altInput: true, altFormat: 'F j, Y h:i K',
                           altInputClass: 'dateDisplay',
                           minDate: firstDate,
                           maxDate: later,
                           defaultDate: start,
                           dateFormat: 'Y-m-d H:i'
                       }}/>
        </FormGroup>
    );
};

DateSelect.propTypes = {
    start:PropTypes.instanceOf(Date).isRequired,
    setStart:PropTypes.func.isRequired
};

const mapStateToProps = (state) =>
    ({
        start: state.uiInfo.routeParams.start
    });

const mapDispatchToProps = {
    setStart
};

export default connect(mapStateToProps,mapDispatchToProps)(DateSelect);