import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import CreateAccount from './CreateAccount';

class Login extends Component {
    state = {
        username: "",
        password: "",
        errText: "",
        redirect: false
    }

    componentWillUnmount(){
        this.props.prepareForLogout();
    }

    onChange = (input) => e => {
        this.setState({[input]: e.currentTarget.value});
    }

    hideText = (input) => {
        var hiddenText = "";
        for(var i=0;i < input.length; i++){
            hiddenText += "*";
        }
        return hiddenText;
    }

    onLoginAttempt = () => {
        const {username, password} = this.state;
        if(username === "" || password === ""){
            this.setState({errText: "Please enter a username and password."});
            return;
        }
        axios.get(`/api/users/name/${username}`)
        .then(res => {
            if(res.status === 400){
                console.log(res);
                this.setState({errText: "User not found. Please enter a valid username."})
            } else {
                if(res.data.password !== password) {
                    console.log("Password does not match.");
                    this.setState({
                        errText: "Password incorrect. Please try again."
                    });
                } else {
                    console.log("Match found.");
                    this.setState({errText: ""});
                    /* axios.post('/api/online/on', {
                        _id: res.data._id,
                        username: res.data.username,
                        favorite: res.data.favorite
                    }).then(res => console.log(res.data)).catch(err => console.log(err)); */
                    this.props.setCurrentUser(res.data);
                    this.setRedirect();
                }
            }
        })
        .catch(err => {
            console.log(err);
            this.setState({errText: "User not found. Please enter a valid username."});
        });
    }

    setRedirect = () => {
        this.setState({redirect: true});
    }
    
    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to="/" />
        }
    }

    onKeyDown = (e) => {
        if(e.keyCode === 13) this.onLoginAttempt();
    }

    render() {
        var {username, password, errText} = this.state;

        if(this.props.userActive){
            return(
                <div className="logoutpage">
                    {this.renderRedirect()}
                    <h1>Logout?</h1><br/>
                    <button className="choiceBtn" onClick={this.props.removeCurrentUser}>Yes</button> 
                    <button className="choiceBtn" onClick={this.setRedirect}>No</button>
                </div>
            )
        }
        else{
            return (
                <div className="loginpage">
                    <div className="login">
                        {this.renderRedirect()}
                        <h1>Login</h1><br/>
                        <p>{errText}</p>
                        <label>Username: </label><br/>
                        <input type="text" onChange={this.onChange("username")} onKeyDown={this.onKeyDown} value={username}/>
                        <br/>
                        <label>Password: </label><br/>
                        <input type="password" onChange={this.onChange("password")} onKeyDown={this.onKeyDown} value={password}/>
                        <br/>
                        <button className="choiceBtn" onClick={this.onLoginAttempt}>Log In</button>
                    </div>
                    <CreateAccount/>
                </div>
            )
        }
    }
}

export default Login;
