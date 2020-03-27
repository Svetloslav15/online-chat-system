import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';

class Messages extends React.Component {
    render() {
        return (
            <div>
                <MessagesHeader/>
                <Segment>
                    <Comment.Group className='messages'>

                    </Comment.Group>
                </Segment>

                <MessageForm/>
            </div>
        )
    }
}

export default Messages;