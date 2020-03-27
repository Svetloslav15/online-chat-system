import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser
    };

    render() {
        const {messagesRef, channel} = this.state;

        return (
            <div>
                <MessagesHeader/>
                <Segment>
                    <Comment.Group className='messages'>

                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    channel={channel}
                    currentUser={this.state.currentUser}
                />
            </div>
        )
    }
}

export default Messages;