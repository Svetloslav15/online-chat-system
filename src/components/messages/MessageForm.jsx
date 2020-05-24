import React from 'react';
import {Button, Segment, Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import {uuid} from 'uuidv4';

import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {
    state = {
        message: '',
        loading: false,
        channel: this.props.channel,
        currentUser: this.props.currentUser,
        percentUploaded: 0,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref('typing')
    };

    openModal = () => this.setState({modal: true});

    closeModal = () => this.setState({modal: false});

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    createMessage = (fileUrl = null) => {
        const {currentUser} = this.state;

        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            star: false,
            user: {
                id: currentUser.uid,
                avatar: currentUser.photoURL,
                name: currentUser.displayName
            }
        };

        if (fileUrl !== null) {
            message['image'] = fileUrl;
        }
        else {
            message['content'] = this.state.message;
        }

        return message;
    };

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private-${this.state.channel.id}`
        }
        return 'chat/public';
    };

    handleKeyDown = () => {
        const {message, typingRef, channel, currentUser} = this.state;

        if (message) {
            typingRef
                .child(channel.id)
                .child(currentUser.uid)
                .set(currentUser.displayName);
        }
        else {
            typingRef
                .child(channel.id)
                .child(currentUser.uid)
                .remove();
        }

    };

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuid()}.jpg`;

        this.setState(
            {
                uploadState: "uploading",
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            },
            () => {
                this.state.uploadTask.on(
                    "state_changed",
                    snap => {
                        const percentUploaded = Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        );
                        this.setState({percentUploaded});
                    },
                    err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null
                        });
                    },
                    () => {
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then(downloadUrl => {
                                this.sendFileMessage(downloadUrl, ref, pathToUpload);
                            })
                            .catch(err => {
                                console.error(err);
                                this.setState({
                                    errors: this.state.errors.concat(err),
                                    uploadState: "error",
                                    uploadTask: null
                                });
                            });
                    }
                );
            }
        );
    };

    sendFileMessage = (downloadUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(downloadUrl))
            .then(() => {
                this.setState({uploadState: 'done'})
            });
    };

    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message, channel, typingRef, currentUser} = this.state;

        if (message) {
            this.setState({loading: true});
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading: false, message: '', errors: []});
                    typingRef
                        .child(channel.id)
                        .child(currentUser.uid)
                        .remove();
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
        const {errors, message, loading, modal, uploadState, percentUploaded} = this.state;

        return (
            <Segment className='message__form'>
                <Input
                    fluid
                    name='message'
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
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
                        disabled={loading}
                        content='Add Reply'
                        labelPosition='left'
                        icon='edit'
                    />
                    <Button
                        color='teal'
                        content='Upload Media'
                        labelPosition='left'
                        icon='cloud upload'
                        onClick={this.openModal}
                        disabled={uploadState === 'uploading'}
                    />

                    <FileModal
                        modal={modal}
                        uploadFile={this.uploadFile}
                        closeModal={this.closeModal}/>
                </Button.Group>
                <ProgressBar
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}/>
            </Segment>
        )
    }
}

export default MessageForm;