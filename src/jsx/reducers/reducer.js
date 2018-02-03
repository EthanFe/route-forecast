/*
let state = {
    controls:{
        metric:false,
        displayBanked,
        stravaAnalysis,
        controlPoints: [
            {name:'here', distance:20, duration:15, arrival:'Jan 13', actual:'Jan 14', banked:'11:05'}
        ]
    },
    // input to fetch weather forecast, populated by loading route
    routeInfo:{
        rwgpsRouteData:
        gpxRouteData:
        timeZoneOffset:
        timeZoneId,
        bounds:{min_latitude:0, max_latitude:0, min_longitude:0, max_longitude:0},
        points:[
            {latitude:17.5, longitude:130.9}...
        ],
        name:"This route",
        finishTime:"Thu, Jan 11 3:29pm",
        weatherCorrectionMinutes
    },
    // received from weather forecast, consumed by map and table rendering components
    forecast:{[
        [time, distance, summary, temperature_str, precipitation, cloudCover, windspeed,
        latitude, longitude, temperature_int, long_time, relative_bearing, rain, wind_bearing]
        ]
        forecastValid:false,
    },

    // entered by user, used to fetch route and request forecast
    ui_fields:[
        start,
        pace,
        interval,
        rwgpsRoute,
        rwgpsRouteIsTrip,
        fetchingRoute:false,
        fetchingForecast:false,
        formVisible:true,
        errorDetails,
        errorSource,
        shortUrl
    ],
    params:{
        action: '/forecast',
        maps_key:'dddsss333',
        timezone_key:'eee444333'
    },
    fetchAfterLoad:false,
    strava: {
        strava_token:null,
        strava_activity:null,
        strava_error,
        fetching,
        actualFinishTime:"Fri, Jan 12 3:29pm",
        actualPace: 18.5,
        stravaStreams:{}
    }
}*/

import * as Actions from '../actions/actions';
import {combineReducers} from 'redux';
import moment from 'moment';

const defaultPace = 'D';
const defaultIntervalInHours = 1;
const startHour = 7;

function initialStartTime() {
    let now = new Date();
    if (now.getHours() > startHour) {
        now.setDate(now.getDate() + 1);
        now.setHours(startHour);
        now.setMinutes(0);
        now.setSeconds(0);
    }
    return now;
}

const uiInfo = function(state = {interval:defaultIntervalInHours,pace:defaultPace,rwgpsRoute:'',
    rwgpsRouteIsTrip:false, formVisible:true, errorDetails:null, start:initialStartTime(),
    succeeded:true, shortUrl:' '}, action) {
    switch (action.type) {
        case Actions.SET_RWGPS_ROUTE:
            return {...state,rwgpsRoute:action.route,loadingSource:null,succeeded:null};
        case Actions.CLEAR_ROUTE_DATA:
            return {...state,loadingSource:null,succeeded:null};
        case Actions.SET_START:
            if (action.start !== null) {
                return {...state,start:action.start};
            } else {
                return state;
            }
        case Actions.SET_PACE:
            if (action.pace !== null) {
                return {...state,pace:action.pace};
            } else {
                return state;
            }
        case Actions.SET_INTERVAL:
            if (action.interval !== null) {
                return {...state,interval:action.interval};
            } else {
                return state;
            }
        case Actions.BEGIN_LOADING_ROUTE:
            return {...state,fetchingRoute:true,loadingSource:action.source};
        case Actions.BEGIN_FETCHING_FORECAST:
            return {...state,fetchingForecast:true};
        case Actions.FORECAST_FETCH_SUCCESS:
            return {...state,fetchingForecast:false,errorDetails:null};
        case Actions.FORECAST_FETCH_FAILURE:
            return {...state,fetchingForecast:false,errorDetails:action.error};
        case Actions.RWGPS_ROUTE_LOADING_SUCCESS:
            return {...state, fetchingRoute:false, errorDetails:null, succeeded:true};
        case Actions.GPX_ROUTE_LOADING_SUCCESS:
            return {...state, fetchingRoute:false, errorDetails:null, succeeded:true};
        case Actions.RWGPS_ROUTE_LOADING_FAILURE:
            return {...state, fetchingRoute:false, errorDetails:action.error, rwgpsRoute:'', succeeded:false};
        case Actions.GPX_ROUTE_LOADING_FAILURE:
            return {...state, fetchingRoute:false, errorDetails:action.error, succeeded:false};
        case Actions.SHOW_FORM:
            return {...state, formVisible:true};
        case Actions.HIDE_FORM:
            return {...state,formVisible:false};
        case Actions.SET_ERROR_DETAILS:
            return {...state,errorDetails:action.details};
        case Actions.SET_SHORT_URL:
            return {...state,shortUrl:action.url};
        default:
            return state;
    }
};

const routeInfo = function(state = {finishTime:'',weatherCorrectionMinutes:null}, action) {
    switch (action.type) {
        case Actions.RWGPS_ROUTE_LOADING_SUCCESS:
            return {...state,rwgpsRouteData:action.routeData.rwgpsRouteData,timeZoneOffset:action.routeData.timeZoneOffset,
                timeZoneId:action.routeData.timeZoneId, gpxRouteData:null};
        case Actions.GPX_ROUTE_LOADING_SUCCESS:
            return {...state,gpxRouteData:action.routeData.gpxRouteData,timeZoneOffset:action.routeData.timeZoneOffset,
                timeZoneId:action.routeData.timeZoneId, rwgpsRouteData:null};
        case Actions.SET_ROUTE_INFO:
            return {...state, ...action.routeInfo};
        case Actions.CLEAR_ROUTE_DATA:
            return {...state,rwgpsRouteData:null,gpxRouteData:null,points:null,name:''};
        // clear when the route is changed
        case Actions.SET_RWGPS_ROUTE:
            return {...state,rwgpsRouteData:null,gpxRouteData:null,points:null,name:''};
        case Actions.ADD_WEATHER_CORRECTION:
            return {...state,weatherCorrectionMinutes:action.weatherCorrectionMinutes,
                finishTime:moment(state.finishTime,'ddd, MMM DD h:mma').add(action.weatherCorrectionMinutes,'minutes').format('ddd, MMM DD h:mma')};
        default:
            return state;
    }
};

const controls = function(state = {metric:false,displayBanked:false,stravaAnalysis:false,controlPoints:[]}, action) {
    switch (action.type) {
        case Actions.SET_METRIC:
            if (action.metric !== undefined) {
                return {...state, metric:action.metric};
            } else {
                return state;
            }
        case Actions.TOGGLE_METRIC:
            return {...state, metric:!state.metric};
        case Actions.TOGGLE_DISPLAY_BANKED:
            return {...state, displayBanked:!state.displayBanked};
        case Actions.TOGGLE_STRAVA_ANALYSIS:
            return {...state, stravaAnalysis:!state.stravaAnalysis};
        case Actions.UPDATE_CONTROLS:
            return {...state, controlPoints:action.controls};
        default:
            return state;
    }
};

const strava = function(state = {}, action) {
    switch (action.type) {
        case Actions.SET_STRAVA_TOKEN:
            if (action.token !== undefined) {
                return {...state, token:action.token};
            }
        case Actions.SET_STRAVA_ACTIVITY:
            if (action.activity !== undefined) {
                return {...state, activity:action.activity};
            }
        case Actions.SET_STRAVA_ERROR:
            if (action.error !== undefined) {
                return {...state, error:action.error};
            }
        case Actions.SET_ACTUAL_FINISH_TIME:
            return {...state, actualFinishTime:action.finishTime};
        case Actions.BEGIN_STRAVA_FETCH:
            return {...state, fetching:true}
        case Actions.STRAVA_FETCH_SUCCESS:
            return {...state, fetching:false, data:action.data}
        case Actions.STRAVA_FETCH_FAILURE:
            return {...state, fetching:false, error:action.error}
        default:
            return state;
    }
};

const forecast = function(state = {forecast:[],valid:false}, action) {
    switch (action.type) {
        case Actions.FORECAST_FETCH_SUCCESS:
            return {...state,forecast:action.forecastInfo.forecast,valid:true};
        case Actions.SET_RWGPS_ROUTE:
            return {...state,valid:false};
        case Actions.GPX_ROUTE_LOADING_SUCCESS:
            return {...state,valid:false};
        case Actions.GPX_ROUTE_LOADING_FAILURE:
            return {...state,valid:false};
        default:
            return state;
    }
};

const params = function(state = {}, action) {
    switch (action.type) {
        case Actions.SET_ACTION_URL:
            return {...state, action: action.action};
        case Actions.SET_API_KEYS:
            return {...state, maps_api_key: action.mapsKey, timezone_api_key:action.timezoneKey};
        default:
            return state;
    }
};

const rootReducer = combineReducers({uiInfo, routeInfo, controls, strava, forecast, params});

export default rootReducer;
