import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        messagesLoading: true,
        messages: []
    };

    componentDidMount() {
        const {channel, currentUser} = this.state;

        if (channel && currentUser) {
            this.addListeners(channel.id);
        }
    }

    addListeners = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId)
            .on('child_added', snap => {
                loadedMessages.push(snap.val());
                this.setState({
                    messages: loadedMessages,
                    messagesLoading: false
                })
            })
    };
    displayMessages = (messages) => (
        messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.currentUser}/>
        ))
    );

    render() {
        const {messagesRef, channel, messages} = this.state;

        return (
            <div>
                <MessagesHeader/>
                <Segment>
                    <Comment.Group className='messages'>
                        {this.displayMessages(messages)}
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