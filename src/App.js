import React from 'react';
import './App.css';

import {connect} from 'react-redux';
import {Grid} from 'semantic-ui-react'
import ColorPanel from './components/color-panel/ColorPanel';
import SidePanel from './components/side-panel/SidePanel';
import Messages from './components/messages/Messages';
import MetaPanel from './components/meta-panel/MetaPanel';

const App = () => (
    <Grid columns='equal' className='app' style={{backgroundColor: '#eee'}}>
        <ColorPanel/>
        <SidePanel/>
        <Grid.Column style={{marginLeft: 320}}>
            <Messages/>
        </Grid.Column>
        <Grid.Column style={{marginLeft: 320}}>
            <MetaPanel/>
        </Grid.Column>
    </Grid>
);
const mapStateToProps = state => ({
    currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(App);
