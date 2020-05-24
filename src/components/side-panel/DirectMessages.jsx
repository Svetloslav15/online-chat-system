import React from 'react';
import firebase from '../../firebase';
import {Icon, Menu} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../store/actions';

class DirectMessages extends React.Component {
    state = {
        users: [],
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        connectedRef: firebase.database().ref('.info/connected'),
        presenceRef: firebase.database().ref('presences'),
        activeChannel: ''
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners = (userId) => {
        let loadedUsers = [];
        this.state.usersRef.on('child_added', snap => {
            if (userId !== snap.key) {
                let user = snap.val();
                user['uid'] = snap.key;
                user['status'] = 'offline';
                loadedUsers.push(user);
                this.setState({users: loadedUsers});
            }
        });

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                const ref = this.state.presenceRef.child(userId);
                ref.set(true);
                ref.onDisconnect()
                    .remove(err => {
                        if (err) {
                            console.log(err);
                        }
                    })
            }
        });

        this.state.presenceRef.on('child_added', snap => {
            if (userId !== snap.key) {
                this.addStatusToUser(snap.key);
            }
        });

        this.state.presenceRef.on('child_removed', snap => {
            if (userId !== snap.key) {
                this.addStatusToUser(snap.key, false);
            }
        })
    };

    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user['status'] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user);
        }, []);
        this.setState({users: updatedUsers});
    };

    isUserOnline = (user) => user.status === 'online';

    changeChannel = user => {
        const channelId = user.uid < this.state.user.uid ?
            `${user.uid}/${this.state.user.uid}` : `${this.state.user.uid}/${user.uid}`;

        const channelData = {
            id: channelId,
            name: user.name
        };

        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    };

    setActiveChannel = (userId) => {
        this.setState({activeChannel: userId});
    };

    render() {
        const {users, activeChannel} = this.state;

        return (
            <Menu.Menu className='menu'>
                <Menu.Item>
                    <span>
                        <Icon name='mail'/> DIRECT MESSAGES
                    </span> ({users.length})
                </Menu.Item>
                {
                    users.map(user => (
                        <Menu.Item
                            key={user.uid}
                            active={user.uid === activeChannel}
                            style={{opacity: 0.7, fontStyle: 'italic'}}
                            onClick={() => this.changeChannel(user)}>
                            <Icon name='circle' color={this.isUserOnline(user) ? 'green' : 'red'}/>
                            @ {user.name}
                        </Menu.Item>
                    ))
                }
            </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(DirectMessages);