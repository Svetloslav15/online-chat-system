import React from 'react';
import {Header, Segment, Input, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';

class MessagesHeader extends React.Component {
    render() {
        const {currentChannel} = this.props;
        return (
            <Segment clearing>
                <Header
                    fluid='true'
                    as='h2'
                    floated='left'
                    style={{marginBottom: 0}}>
                    <span>
                        {currentChannel && currentChannel.name}
                        <Icon name='star outline'
                              color='black'/>
                    </span>
                    <Header.Subheader>
                        2 users
                    </Header.Subheader>
                </Header>
                <Header floated='right'>
                    <Input
                        size='mini'
                        icon='search'
                        name='searchTerm'
                        placeholder='Search Messages'/>
                </Header>
            </Segment>
        )
    }
}

const mapStateToProps = (state) => ({
    currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps, null)(MessagesHeader);