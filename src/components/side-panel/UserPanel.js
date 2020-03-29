import React from 'react';
import firebase from '../../firebase';
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends React.Component {
    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref('users'),
        metadata: {
            contentType: 'image/jpeg'
        },
        uploadedImage: ''
    };

    openModal = () => this.setState({modal: true});

    closeModal = () => this.setState({modal: false});

    dropdownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.user && this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>,
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>,
        }
    ];

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log('Signed out!');
            });
    };

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas()
                .toBlob(blob => {
                    let imageUrl = URL.createObjectURL(blob);
                    this.setState({
                        croppedImage: imageUrl,
                        blob
                    })
                })
        }
    };

    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({previewImage: reader.result});
            })
        }
    };

    uploadImage = () => {
        const {storageRef, userRef, metadata, blob} = this.state;

        storageRef
            .child(`avatars/user-${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL()
                    .then(url => {
                        this.setState({uploadedImage: url}, () => {
                            this.changeAvatar();
                        });
                    })
            })
    };

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedImage
            })
            .then(() => {
                this.closeModal();
            }).catch(console.error);

        this.state.usersRef
            .child(this.state.user.uid)
            .update({avatar: this.state.uploadedImage})
            .then(console.log)
            .catch(console.log);
    };

    render() {
        const {user, modal, previewImage, croppedImage} = this.state;
        return (
            <Grid style={{background: '#4c3c4c'}}>
                <Grid.Column>
                    <Grid.Row style={{padding: '1.2em', margin: 0}}>
                        <Header inverted floated='left' as='h2'>
                            <Header.Content>
                                <Icon name='code'/>
                                DevChat
                            </Header.Content>
                        </Header>
                        <Header style={{padding: '0.25em'}} as='h4' inverted>
                            <Dropdown
                                trigger={
                                    <span>
                                    <Image src={user.photoURL} spaced='right' avatar/>
                                        {user.displayName}</span>
                                } options={this.dropdownOptions()}/>
                        </Header>
                    </Grid.Row>

                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input fluid
                                   type='file'
                                   label='New Avatar'
                                   name='previewImage'
                                   onChange={this.handleChange}
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className='ui center aligned grid'>
                                        {previewImage && (
                                            <AvatarEditor
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                                style={{margin: '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && (
                                <Button color='green'
                                onClick={this.uploadImage}>
                                    <Icon name='save'/>
                                    CHANGE AVATAR
                                </Button>)
                            }
                            <Button color='blue' onClick={this.handleCropImage}>
                                <Icon name='image'/>
                                PREVIEW
                            </Button>
                            <Button
                                inverted
                                color='red'
                                onClick={this.closeModal}
                            >
                                <Icon name='cancel'/>
                                CANCEL</Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.user.currentUser
});

export default connect(mapStateToProps, null)(UserPanel);