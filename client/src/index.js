import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth0Provider } from "@auth0/auth0-react";

const providerConfig = {
    domain: "a-lists.us.auth0.com",
    clientId: "Fh6gxt8ZVoGSYdBTzbLwMbc2NgsnNZPd",
    redirectUri: "https://serene-fjord-76369.herokuapp.com/dashboard"
};

ReactDOM.render(
    <Auth0Provider {...providerConfig}>
        <App />
    </Auth0Provider>,
    document.getElementById('root')
);
