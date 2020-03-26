import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleSubmit = (event) => {
        event.preventDefault();

        if (this.isFormValid()) {
            this.setState({errors: [], loading: true});

            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(user => {
                    user.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(user.user.email)}?d=identicon`
                    }).then(() => {
                        this.saveUser(user)
                            .then(() => {
                                console.log('user saved');
                            });
                    });
                    this.setState({loading: false});
                })
                .catch(err => {
                    this.setState({errors: this.state.errors.concat(err), loading: false});
                })
        }
    };

    saveUser = (user) => {
        return this.state.usersRef.child(user.user.uid)
            .set({
                name: user.user.displayName,
                avatar: user.user.photoURL
            });
    };

    isFormValid = () => {
        const errors = [];
        let error;

        if (this.isFormEmpty(this.state)) {
            error = {
                message: 'Fill in all fields'
            };
            this.setState({errors: errors.concat(error)});
            return false;
        }
        else if (!this.isPasswordValid(this.state)) {
            error = {
                message: 'Passwords should match'
            };
            this.setState({errors: errors.concat(error)});
            return false;
        }
        else {
            return true;
        }
    };

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length ||
            !passwordConfirmation.length;
    };

    isPasswordValid = ({password, passwordConfirmation}) => {
        if (password !== passwordConfirmation) {
            return false;
        }
        else if (password.length < 6) {
            return false;
        }

        return true;
    };

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

    render = () => {
        const {
            username, email, password, passwordConfirmation,
            errors, loading
        } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="bug" color="orange"/>
                        Register for DevChat
                    </Header>
                    {
                        errors.length > 0 && (
                            <Message error>
                                {this.displayErrors(errors)}
                            </Message>
                        )
                    }
                    {
                        loading && (
                            <Message info>
                                Loading...
                            </Message>
                        )
                    }
                    <Form size="large">
                        <Segment stacked>
                            <Form.Input fluid name="username"
                                        icon="user"
                                        iconPosition="left"
                                        placeholder="Username"
                                        onChange={this.handleChange}
                                        type="text"
                                        value={username}/>

                            <Form.Input fluid name="email"
                                        icon="mail"
                                        iconPosition="left"
                                        placeholder="Email"
                                        onChange={this.handleChange}
                                        type="email"
                                        value={email}/>

                            <Form.Input fluid name="password"
                                        icon="lock"
                                        iconPosition="left"
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                        type="password"
                                        value={password}/>

                            <Form.Input fluid name="passwordConfirmation"
                                        icon="repeat"
                                        iconPosition="left"
                                        placeholder="Password Confirmation"
                                        onChange={this.handleChange}
                                        type="password"
                                        value={passwordConfirmation}/>

                            <Button disabled={loading} className={loading ? 'loading' : ''}
                                    color="orange"
                                    size="large"
                                    onClick={this.handleSubmit}>Submit</Button>
                        </Segment>
                    </Form>

                    <Message>Already a user? <Link to='/login'>Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;