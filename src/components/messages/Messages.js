import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        usersRef: firebase.database().ref('users'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        messagesLoading: true,
        messages: [],
        usersCount: 0,
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        isChannelStarred: false
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    };

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    };

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.currentUser.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.currentUser.photoURL
                        }
                    }
                })
        }
        else {
            this.state.usersRef
                .child(`${this.state.currentUser.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err) {
                        console.log(err);
                    }
                })
        }
    };

    componentDidMount() {
        const {channel, currentUser} = this.state;

        if (channel && currentUser) {
            this.addListeners(channel.id);
            this.addUserStarsListener(channel.id, currentUser.uid);
        }
    }

    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if (data.val() !== null) {
                    const channelsId = Object.keys(data.val());
                    const prevStarred = channelsId.includes(channelId);
                    this.setState({isChannelStarred: prevStarred});
                }
            });
    };

    addListeners = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();

        ref.child(channelId)
            .on('child_added', snap => {
                loadedMessages.push(snap.val());
                this.setState({
                    messages: loadedMessages,
                    messagesLoading: false
                })
            });
        this.countUniqueUsers(loadedMessages);
    };

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);

        const numUniqueUsers = `${uniqueUsers.length} users`;
        this.setState({usersCount: numUniqueUsers});
    };

    displayMessages = (messages) => (
        messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                starMessage={this.starMessage}
                user={this.state.currentUser}/>
        ))
    );

    starMessage = (message) => {
        const {channel, messagesRef} = this.state;

        messagesRef.child(channel.id).once('value', function (snapshot) {
            snapshot.forEach(function (snap) {
                if (snap.val().timestamp === message.timestamp) {
                    messagesRef
                        .child(channel.id)
                        .child(snap.key)
                        .update({star: !snap.val().star});
                }
            });
        });
    };

    handleSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if (message.content) {
                if (message.content.match(regex) || message.user.name.match(regex)) {
                    acc.push(message);
                }
            }
            return acc;
        }, []);
        this.setState({searchResults: searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    displayChannelName = (channel) => {
        return channel ? `${this.state.privateChannel ? '@ ' : '# '}${channel.name}` : '';
    };

    render() {
        const {
            messagesRef, channel, messages, usersCount, searchTerm,
            isChannelStarred, searchResults, searchLoading, privateChannel
        } = this.state;
        return (
            <div>
                <MessagesHeader
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                    channelName={this.displayChannelName(channel)}
                    usersCount={usersCount}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                />
                <Segment>
                    <Comment.Group className='messages'>
                        {
                            searchTerm ? this.displayMessages(searchResults)
                                : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    channel={channel}
                    currentUser={this.state.currentUser}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </div>
        )
    }
}

export default Messages;