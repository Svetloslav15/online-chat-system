import React, {useState} from 'react';
import {Comment, Image, Icon} from 'semantic-ui-react';
import moment from 'moment';

const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? 'message-self' : ''
};

const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content')
};


const timeFromNow = timestamp => moment(timestamp).fromNow();

const Message = ({user, message, starMessage}) => {
    const [star, toggleStar] = useState(message.star);

    const starMessageWithShow = () => {
        starMessage(message);
        toggleStar(!star);
    };

    return (
        <Comment onClick={() => starMessageWithShow(starMessage, message)}>
            <Comment.Avatar src={message.user.avatar}/>
            <Comment.Content className={isOwnMessage(message, user)}>
                <Comment.Author as='a'>{message.user.name}</Comment.Author>
                <Comment.Metadata>
                    {timeFromNow(message.timestamp)} {star === true && <Icon name='star' color='yellow'/>}
                </Comment.Metadata>
                {
                    isImage(message) ? <Image src={message.image} className='message-image'/> :
                        <Comment.Text>{message.content}</Comment.Text>
                }
            </Comment.Content>
        </Comment>
    );
}

export default Message;