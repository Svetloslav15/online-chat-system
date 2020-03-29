import React from 'react';
import {Segment, Accordion, Header, Icon, Label, Comment, Image} from 'semantic-ui-react';
import firebase from '../../firebase';

class MetaPanel extends React.Component {
    state = {
        activeIndex: 0,
        currentChannel: this.props.currentChannel,
        isPrivateChannel: this.props.isPrivateChannel,
        messagesRef: firebase.database().ref('messages'),
        starredMessages: []
    };

    componentDidMount() {
        const {messagesRef} = this.state;
        this.getStarredMessages();

        messagesRef.on("child_changed", () => {
            this.getStarredMessages();
        });
    }

    getStarredMessages = () => {
        const {currentChannel, messagesRef} = this.state;
        const starredMessages = [];

        if (currentChannel) {
            messagesRef.child(currentChannel.id).once('value', function (snapshot) {
                snapshot.forEach(function (message) {
                    if (message.val().star === true) {
                        starredMessages.push(message.val());
                    }
                });
            });
        }

        this.setState({starredMessages});
    };

    displayStarredMessages = (starredMessages) => (
        starredMessages.map(x => (
            <Comment>
                <Comment.Avatar src={x.user.avatar}/>
                <Comment.Content>
                    <Comment.Author as='a'>{x.user.name}</Comment.Author>
                    {
                        x.image ? <Image src={x.image} className='message-image'/> :
                            <Comment.Text>{x.content}</Comment.Text>
                    }
                </Comment.Content>
            </Comment>
        ))
    );


    setActiveIndex = (event, titleProps) => {
        const {index} = titleProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({activeIndex: newIndex});
    };

    render() {
        const {activeIndex, isPrivateChannel, currentChannel, starredMessages} = this.state;

        if (isPrivateChannel) {
            return null;
        }

        return (
            <Segment>
                <Header as='h3' attached='top'>
                    ABOUT # {currentChannel && currentChannel.name}
                </Header>
                <Accordion styled attached='true'>
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={'dropdown'}/>
                        <Icon name={'info'}/>
                        Channel Info
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {currentChannel && currentChannel.details}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={'dropdown'}/>
                        <Icon name={'star'}/>
                        Starred Posts
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1} style={{overflow: 'auto', maxHeight: 200}}>
                        {this.displayStarredMessages(starredMessages)}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={'dropdown'}/>
                        <Icon name={'pencil alternative'}/>
                        Created By
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Label as='a' image>
                            <img src={currentChannel && currentChannel.createdBy.avatar}/>
                            {currentChannel && currentChannel.createdBy.name}
                        </Label>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        )
    }
}

export default MetaPanel;