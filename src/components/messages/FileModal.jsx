import React from 'react';
import mime from 'mime-types';
import {Modal, Input, Button, Icon} from 'semantic-ui-react';

class FileModal extends React.Component {
    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png', 'image/jpg']
    };

    addFile = (event) => {
        const file = event.target.files[0];

        if (file) {
            this.setState({file: file});
        }
    };

    isAuthorized = (fileName) => this.state.authorized.includes(mime.lookup(fileName));

    sendFile = () => {
        const {file} = this.state;
        const {uploadFile, closeModal} = this.props;

        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                const metadata = {
                    contentType: mime.lookup(file.name)
                };

                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    };
    clearFile = () => this.setState({file: null});

    render() {
        const {modal, closeModal} = this.props;

        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>
                    Select an image file
                </Modal.Header>
                <Modal.Content>
                    <Input
                        fluid
                        label='File types: jpg, png'
                        name='file'
                        type='file'
                        accept='image/*'
                        onChange={this.addFile}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color='green'
                        onClick={this.sendFile}
                    >
                        <Icon name='checkmark'/>
                        Send
                    </Button>
                    <Button
                        inverted
                        color='red'
                        onClick={closeModal}
                    >
                        <Icon name='cancel'/>
                        Cancel</Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal;