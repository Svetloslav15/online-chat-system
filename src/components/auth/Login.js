import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Login extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleSubmit = (event) => {
        event.preventDefault();

        if (this.isFormValid(this.state)) {
            this.setState({errors: [], loading: true});

            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signInUser => {
                    console.log(signInUser);
                })
                .catch(err => {
                    this.setState({
                        errors: this.state.errors.concat(err),
                        loading: false
                    })
                });
        }
    };
    isFormValid = ({email, password}) => email && password;

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

    render = () => {
        const {
            email, password,
            errors, loading
        } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h2" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"/>
                        Login to DevChat
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

                            <Button disabled={loading} className={loading ? 'loading' : ''}
                                    color="violet"
                                    size="large"
                                    onClick={this.handleSubmit}>Submit</Button>
                        </Segment>
                    </Form>

                    <Message>Don't have an account? <Link to='/register'>Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;