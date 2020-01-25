import React, { Component } from 'react'
import axios from 'axios';

class CreateAccount extends Component {
    state ={
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        errText: "",
        created: false,
        passwordMatch: false
    }

    onChange = (input) => e => {
        this.setState({[input]: e.currentTarget.value});
        if(input !== "passwordConfirm" && this.state.passwordConfirm.length > 0){
            if(this.state.passwordConfirm !== this.state.password){
                this.setState({errText: "Password does not match."});
            }
            else{
                this.setState({errText: "", passwordMatch: true});
            }
        }
    }

    onKeyDown = (e) => {
        if(e.keyCode === 13) this.onCreateAttempt();
    }

    onCreateAttempt = () => {
        this.setState({errText: ""});
        const {username, password, passwordConfirm, email, passwordMatch} = this.state;
        var okUsername, okEmail = false;
        //var addUser = {};
        if(username === "" || password === "" || passwordConfirm === "" || email === ""){
            this.setState({errText: "Please enter a value in all fields."});
            return;
        }
        //check for username already existing
        //check for email already existing
        //check for passwordMatch to be true
        axios.get(`api/users/name/${username}`)
        .then(res => {
            if(res.status === 200){
                this.setState({errText: "Username taken. Please enter a new username."});
                return;
            }
        }).catch(res => {
            console.log(username);
            okUsername = true;
            axios.get(`api/users/email/${email}`)
            .then(res => {
                if(res.status === 200){
                    this.setState({errText: "Email is already associated with an existing account. Please choose a new email."});
                    return;
                }
            }).catch(res => {
                console.log(email);
                okEmail = true;
                if(passwordMatch && okUsername && okEmail){
                    axios.post('api/users/add', {
                        username: username,
                        password: password,
                        email: email,
                        online: true,
                        favorite: `default${Math.floor(Math.random() * 5)}`
                    }).then(res => {
                        console.log(res);
                        if(res.status === 200){
                            this.setState({created: true});
                        }
                    })
                } else {
                    this.setState({errText: "There was an error with the information you entered."});
                }
            });
        });
    }

    render() {
        var {username, email, password, passwordConfirm, errText, created} = this.state;
        if(!created){
            return(
                <div className="create">
                    <h2>Create an account</h2>
                    <p>{errText}</p><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label>Username: </label>
                                </td>
                                <td>
                                    <input type="text" onChange={this.onChange("username")} onKeyDown={this.onKeyDown} value={username}/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Password: </label>
                                </td>
                                <td>
                                    <input type="password" onChange={this.onChange("password")} onKeyDown={this.onKeyDown} value={password}/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Confirm Password: </label>
                                </td>
                                <td>
                                    <input type="password" onChange={this.onChange("passwordConfirm")} onKeyDown={this.onKeyDown} value={passwordConfirm}/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Email: </label>
                                </td>
                                <td>
                                    <input type="text" onChange={this.onChange("email")} onKeyDown={this.onKeyDown} value={email}/>
                                </td>
                            </tr>
                        </tbody>
                    </table><br/>
                    <button className="choiceBtn" onClick={this.onCreateAttempt}>Create Account</button>
                </div>
            )
        } else {
            return(
                <div>
                    <h2>Success! Account created.</h2><br/>
                    {/* Welcome to insert name here, username here! */}
                    <h3>Login to start battling!</h3>
                </div>
            )
        }
    }
}

export default CreateAccount;
