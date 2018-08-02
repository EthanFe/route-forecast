import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import configureStore from './configureStore';
import RouteWeatherUI from './main';
import ErrorBoundary from './errorBoundary';

/*global Raven*/
let script = document.getElementById( "routeui" );
const store = configureStore(undefined,script.getAttribute('mode'));
Raven.config('https://ea4c472ff9054dab8c18d594b95d8da2@sentry.io/298059').install();

render(
    <ErrorBoundary>
        <Provider store={store}>
            <RouteWeatherUI />
        </Provider>
    </ErrorBoundary>,
    document.getElementById('content')
);