import React from 'react';
import {Menu, Icon, Modal, Form, Input, Button, Label} from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../store/actions';

class Channels extends React.Component {
    state = {
        activeChannel: '',
        channel: null,
        user: this.props.currentUser,
        channels: [],
        modal: false,
        channelName: '',
        channelsRef: firebase.database().ref('channels'),
        channelDetails: '',
        firstLoad: '',
        messagesRef: firebase.database().ref('messages'),
        typingRef: firebase.database().ref('typing'),
        notifications: []
    };

    componentDidMount() {
        this.addListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels, firstLoad: true}, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    };

    addNotificationListener = (channelId) => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, this.state.id, this.state.notifications, snap);
            }
        });
    };

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(x => x.id === channelId);

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;

                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }

            notifications[index].lastKnownTotal = snap.numChildren();
        }
        else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }
        this.setState({notifications});
    };

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
        }

        this.setState({firstLoad: false});
    };

    closeModal = () => this.setState({modal: false});
    openModal = () => this.setState({modal: true});

    changeChannel = (channel) => {
        this.setActiveChannel(channel);
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove();
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({channel});
    };

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(x => x.id === this.state.channel.id);

        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({notifications: updatedNotifications});
        }
    };

    setActiveChannel = (channel) => {
        this.setState({activeChannel: channel.id});
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    addChannel = () => {
        const {channelsRef, channelName, channelDetails, user} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({channelName: '', channelDetails: ''});
                this.closeModal();
            });
    };

    handleSubmit = event => {
        event.preventDefault();

        if (this.isFormValid(this.state)) {
            this.addChannel();
        }
    };

    isFormValid = ({channelName, channelDetails}) => channelDetails && channelName;

    getNotificationCount = (channel) => {
        let count = 0;
        this.state.notifications.forEach(x => {
            if (x.id === channel.id) {
                count = x.count;
            }
        });

        if (count > 0) {
            return count;
        }
    };

    displayChannels = channels => (
        channels.length > 0 && channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}>
                {this.getNotificationCount(channel) && (
                    <Label color='red'>{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    );

    render() {
        const {channels, modal} = this.state;

        return (
            <div>
                <Menu.Menu style={{paddingBottom: '2em'}}>
                    <Menu.Item>
                    <span>
                        <Icon name='exchange'/> CHANNELS
                    </span> ({channels.length}) <Icon name='add' onClick={this.openModal}/>

                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a channel</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input
                                    fluid
                                    label='Name of channel'
                                    name='channelName'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label='About the channel'
                                    name='channelDetails'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color='green' onClick={this.handleSubmit}>
                            <Icon name='checkmark'/> ADD
                        </Button>
                        <Button color='red' inverted onClick={this.closeModal}>
                            <Icon name='trash'/> CANCEL
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);