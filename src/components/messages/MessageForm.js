import React from 'react';
import {Button, Segment, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

class MessageForm extends React.Component {
    state = {
        message: '',
        loading: false,
        channel: this.props.channel,
        currentUser: this.props.currentUser,
        errors: []
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    createMessage = () => {
        const {currentUser} = this.state;

        return {
            content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                avatar: currentUser.photoURL,
                name: currentUser.displayName
            }
        };
    };

    sendMessage = () => {
        const {messagesRef} = this.props;
        const {message, channel} = this.state;

        if (message) {
            this.setState({loading: true});
            messagesRef
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading: false, message: '', errors: []})
                })
                .catch((err) => {
                    this.setState({loading: false, errors: this.state.errors.concat(err)})
                });
        }
        else {
            this.setState({errors: this.state.errors.concat('Add a message')})
        }
    };

    render() {
        const {errors, message} = this.state;

        return (
            <Segment className='message__form'>
                <Input
                    fluid
                    name='message'
                    onChange={this.handleChange}
                    style={{marginBottom: '0.7em'}}
                    label={<Button icon={'add'}/>}
                    labelPosition='left'
                    className={errors.some(err => err.includes('message')) ? 'error' : ''}
                    placeholder='Write your message'
                    value={message}
                />
                <Button.Group icon widths='2'>
                    <Button
                        onClick={this.sendMessage}
                        color='orange'
                        content='Add Reply'
                        labelPosition='left'
                        icon='edit'
                    />
                    <Button
                        color='teal'
                        content='Upload Media'
                        labelPosition='left'
                        icon='cloud upload'
                    />
                </Button.Group>
            </Segment>
        )
    }
}

export default MessageForm;