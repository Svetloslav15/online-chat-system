import React from 'react';
import {Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../store/actions';

class Channels extends React.Component {
    state = {
        activeChannel: '',
        user: this.props.currentUser,
        channels: [],
        modal: false,
        channelName: '',
        channelsRef: firebase.database().ref('channels'),
        channelDetails: '',
        firstLoad: ''
    };

    componentDidMount() {
        this.addListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels, firstLoad: true}, () => this.setFirstChannel());
        });
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
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
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

    displayChannels = channels => (
        channels.length > 0 && channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}>
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
                        <Icon name='exchange'/>
                        CHANNELS
                    </span>
                        ({channels.length}) <Icon name='add' onClick={this.openModal}/>
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