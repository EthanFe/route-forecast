import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import ErrorBoundary from "./errorBoundary";
import darkSky from 'Images/darkSkySmall.png';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class ForecastTable extends Component {
    static propTypes = {
        weatherCorrectionMinutes:PropTypes.number,
        forecast:PropTypes.arrayOf(PropTypes.array).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    static expandTable(forecast) {
        const redText = ({color:'red'});
        const orange = ({color:'darkOrange'});
        const skyBlue = ({color:'deepSkyBlue'});
        if (forecast.length > 0 && forecast[0].length > 5) {
            return (
                <tbody>
                {forecast.map((point) =>
                    /*<tr key={Math.random().toString(36).slice(2)}>*/
                    <tr key={point[0]+Math.random().toString(10)}>
                        <td>{point[0]}</td>
                        <td>{point[1]}</td>
                        <td>{point[2]}</td>
                        <td>{point[3]}</td>
                        <td>{point[4]}</td>
                        <td>{point[5]}</td>
                        <td style={point[11]<90?(Math.cos((Math.PI / 180)*point[11])*parseInt(point[6])>10?redText:orange):skyBlue}>{point[6]}</td>
                    </tr>
                )}
                </tbody>
            );
        }
    }

/*
    doesForecastMatch(newForecast,oldForecast) {
        return (newForecast[0]===oldForecast[0] &&
            newForecast[1]===oldForecast[1] &&
            newForecast[2]===oldForecast[2] &&
            newForecast[3]===oldForecast[3]);
    }


    shouldComponentUpdate(nextProps, newState, nextContext) {
        let forecast = this.props.forecast;
        return nextProps.weatherCorrectionMinutes!==this.props.weatherCorrectionMinutes ||
            nextProps.forecast.length!==this.props.forecast.length ||
            !nextProps.forecast.every((v,i)=> this.doesForecastMatch(v,forecast[i]));
    }

*/
    render() {
        let weatherCorrections;
        if (this.props.weatherCorrectionMinutes !== null) {
            if (this.props.weatherCorrectionMinutes >= 0) {
                weatherCorrections = Math.round(this.props.weatherCorrectionMinutes) + " minutes lost to wind";
            }
            else {
                weatherCorrections = -Math.round(this.props.weatherCorrectionMinutes) + " minutes gained from wind";
            }
        }
        else {
            weatherCorrections = null;
        }
        return (
                <div>
                    <ErrorBoundary>
                    <a tabIndex='-1' href="https://darksky.net/poweredby/"><img src={darkSky}/></a>
                        {weatherCorrections}
                    <Table striped condensed hover bordered>
                        <thead>
                        <tr>
                            <th style={{'fontSize':'80%'}}>Time</th>
                            <th style={{'fontSize':'80%'}}>Mile</th>
                            <th style={{'fontSize':'80%'}}>Summary</th>
                            <th style={{'fontSize':'80%'}}>Temperature</th>
                            <th style={{'fontSize':'80%'}}>Chance of rain</th>
                            <th style={{'fontSize':'80%'}}>Cloud cover</th>
                            <th style={{'fontSize':'80%'}}>Wind speed</th>
                        </tr>
                        </thead>
                        {ForecastTable.expandTable(this.props.forecast)}
                    </Table>
                    </ErrorBoundary>
                </div>
        );
    }
}

const mapStateToProps = (state, ownProps) =>
    ({
        forecast: state.forecast.forecast,
        weatherCorrectionMinutes: state.routeInfo.weatherCorrectionMinutes
    });

export default connect(mapStateToProps)(ForecastTable);