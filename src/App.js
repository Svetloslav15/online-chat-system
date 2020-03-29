import React from 'react';
import './App.css';

import {connect} from 'react-redux';
import {Grid} from 'semantic-ui-react'
import ColorPanel from './components/color-panel/ColorPanel';
import SidePanel from './components/side-panel/SidePanel';
import Messages from './components/messages/Messages';
import MetaPanel from './components/meta-panel/MetaPanel';

const App = (props) => (
    <Grid columns='equal' className='app' style={{backgroundColor: '#eee'}}>
        <ColorPanel/>
        <SidePanel
            key={props.currentUser && props.currentUser.id}
            currentUser={props.currentUser}/>
        <Grid.Column style={{marginLeft: 320}}>
            <Messages
                key={props.currentChannel && props.currentChannel.id}
                currentChannel={props.currentChannel}
                currentUser={props.currentUser}
                isPrivateChannel={props.isPrivateChannel}
            />
        </Grid.Column>
        <Grid.Column width={4}>
            <MetaPanel key={props.currentChannel && props.currentChannel.id}
                       currentChannel={props.currentChannel}
                       isPrivateChannel={props.isPrivateChannel}/>
        </Grid.Column>
    </Grid>
);
const mapStateToProps = state => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(App);
