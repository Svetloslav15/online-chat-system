import React from 'react';
import {Segment, Accordion, Header, Icon, Label, List, Image} from 'semantic-ui-react';

class MetaPanel extends React.Component {
    state = {
        activeIndex: 0,
        currentChannel: this.props.currentChannel,
        isPrivateChannel: this.props.isPrivateChannel
    };

    setActiveIndex = (event, titleProps) => {
        const {index} = titleProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({activeIndex: newIndex});
    };

    render() {
        const {activeIndex, isPrivateChannel, currentChannel} = this.state;

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
                    <Accordion.Content active={activeIndex === 1}>
                        details
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
                            <img src={currentChannel && currentChannel.createdBy.avatar} />
                            {currentChannel && currentChannel.createdBy.name}
                        </Label>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        )
    }
}

export default MetaPanel;