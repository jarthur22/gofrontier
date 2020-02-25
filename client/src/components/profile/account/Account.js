import React, { Component } from 'react'
import {Link} from 'react-router-dom';
import axios from 'axios';

class Account extends Component {
    _isMounted = false;
    state = {
        changingEmail: false,
        changingPassword: false,
        changingFavorite: false,
        validated: {},
        enteredPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        newEmail: "",
        submittedEmail: "",
        submittedPassword: "",
        submittedFavorite: "",
        suggestions: [],
        // The active selection's index
        activeSuggestion: 0,
        // The suggestions that match the user's input
        filteredSuggestions: [],
        // Whether or not the suggestion list is shown
        showSuggestions: false,
        // What the user has entered
        userInput: ""
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get('/api/pokemon/names')
        .then(res => {
            console.log(res);
            if(res.data.length > 0) {
                if(this._isMounted) this.setState({suggestions: res.data});
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    onChange = (input) => e => {
        if(input !== "favorite"){
            this.setState({[input]: e.currentTarget.value});
        }else if(this.state.suggestions.length){
            const { suggestions } = this.state;
            const userInput = e.currentTarget.value;

            // Filter our suggestions that don't contain the user's input
            
            const filteredSuggestions = suggestions.filter(
            suggestion => {
                return suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
            });

            // Update the user input and filtered suggestions, reset the active
            // suggestion and make sure the suggestions are shown
            this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value
            });
        }
    }

    onClickFavoriteSuggestion = e => {
        // Update the user input and reset the rest of the state
        this.setState({
        activeSuggestion: 0,
        filteredSuggestions: [],
        showSuggestions: false,
        userInput: e.currentTarget.innerText
        });
    }

    onKeyDownFavorite = e => {
        const { activeSuggestion, filteredSuggestions } = this.state;
        // User pressed the enter key, update the input and close the
        // suggestions
        if (e.keyCode === 13) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion]
            });
        }
        // User pressed the up arrow, decrement the index
        else if (e.keyCode === 38) {
        if (activeSuggestion === 0) {
            return;
        }
        this.setState({ activeSuggestion: activeSuggestion - 1 });
        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
        if (activeSuggestion - 1 === filteredSuggestions.length) {
            return;
        }

        this.setState({ activeSuggestion: activeSuggestion + 1 });
        }
    }

    submitEmailChange = () => {
        const {newEmail} = this.state;
        const {_id} = this.props.currentUser;
        if(!newEmail.includes("@")){
            this.setState({submittedEmail: "failure"});
        }
        else if(newEmail !== ""){
            axios.post(`/api/users/update/email/${_id}`, {
                email: newEmail
            }).then(res => {
                console.log(res);
                this.setState({submittedEmail: "success"});
            });
            axios.get(`/api/users/${_id}`).then(res => {
                this.props.setCurrentUser(res.data);
            });
        }
    }

    onClickEmail = () => {
        this.state.changingEmail ?
        this.setState({changingEmail: false}) :
        this.setState({changingEmail: true})
    }

    renderChangeEmail = () => {
        const {changingEmail, validated, enteredPassword, newEmail, submittedEmail} = this.state;
        if(changingEmail){
            if(validated.status){
                if(validated.message){
                    setTimeout(() => {
                        this.setState({
                            enteredPassword: "",
                            validated: {}
                        });
                    }, 3000);
                    return(
                        <React.Fragment>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>Current Password: </label>
                                    <input type="password" onChange={this.onChange("enteredPassword")} value={enteredPassword}/>
                                    <button onClick={this.submitCurrentPassword}>Submit Password</button>
                                </td>
                            </tr>
                            <tr>
                                <td className = "row1"></td>
                                <td>{validated.message}</td>
                            </tr>
                        </React.Fragment>
                    )
                }
                if(submittedEmail === "failure"){
                    setTimeout(() => {
                        this.setState({changingEmail: false, submittedEmail: "", newEmail: "", enteredPassword: ""});
                    }, 3000);
                    return(
                        <tr>
                            <td className="row1"></td>
                            <td>Submission failed. Please check your information and try again.</td>
                        </tr>
                    )
                }else if(submittedEmail === "success"){
                    setTimeout(() => {
                        this.setState({
                            changingEmail: false, 
                            submittedEmail: "", 
                            newEmail: "", 
                            enteredPassword: "",
                            validated: {}
                        });
                    }, 3000);
                    return(
                        <tr>
                            <td className="row1"></td>
                            <td>Email changed!</td>
                        </tr>
                    )
                }else if(submittedEmail === ""){
                    return(
                        <React.Fragment>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>Current Password: </label>
                                    <input type="password" onChange={this.onChange("enteredPassword")} value={enteredPassword}/>
                                </td>
                            </tr>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>New Email: </label>
                                    <input type="text" onChange={this.onChange("newEmail")} value={newEmail}/>
                                </td>
                            </tr>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <button onClick={this.submitEmailChange}>Change Email</button>
                                </td>
                            </tr>
                        </React.Fragment>
                    )
                }
            }else {
                return(
                    <React.Fragment>
                        <tr>
                            <td className="row1"></td>
                            <td>
                                <label>Current Password: </label>
                                <input type="password" onChange={this.onChange("enteredPassword")} value={enteredPassword}/>
                                <button onClick={this.submitCurrentPassword}>Submit Password</button>
                            </td>
                        </tr>
                    </React.Fragment>
                )
            }
        }
    }

    onClickPassword = () => {
        this.state.changingPassword ?
        this.setState({changingPassword: false}) :
        this.setState({changingPassword: true})
    }

    submitPasswordChange = () => {
        const {newPassword, confirmNewPassword} = this.state;
        const {_id} = this.props.currentUser;
        if(newPassword !== confirmNewPassword){
            this.setState({submittedPassword: "failure"});
        }else{
            axios.post(`/api/users/update/password/${_id}`, {
                password: newPassword
            }).then(res => {
                console.log(res);
                this.setState({submittedPassword: "success"});
            });
            axios.get(`/api/users/${_id}`).then(res => {
                this.props.setCurrentUser(res.data);
                this.setState({enteredPassword: this.props.currentUser.password});
            });
        }
    }

    submitCurrentPassword = () => {
        const {username} = this.props.currentUser;
        const {enteredPassword} = this.state;
        console.log(enteredPassword);
        axios.post('/api/users/login', {username, password: enteredPassword}).then(res => {
            console.log(res);
            if(res.status === 400){
                console.log(res);
            } else {
                if(res.data.message){
                    this.setState({validated: {
                        status: "failed",
                        message: res.data.message
                    }});
                } else {
                    this.setState({validated: {
                        status: "accepted"
                    }});
                }
            }
        }).catch(err => console.log(err));
    }

    renderChangePassword = () => {
        const {changingPassword, validated, enteredPassword, newPassword, confirmNewPassword, submittedPassword} = this.state;
        if(changingPassword){
            if(validated.status){
                if(validated.message){
                    setTimeout(() => {
                        this.setState({
                            enteredPassword: "",
                            validated: {}
                        });
                    }, 3000);
                    return(
                        <React.Fragment>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>Current Password: </label>
                                    <input type="password" onChange={this.onChange("enteredPassword")} value={enteredPassword}/>
                                    <button onClick={this.submitCurrentPassword}>Submit Password</button>
                                </td>
                            </tr>
                            <tr>
                                <td className = "row1"></td>
                                <td>{validated.message}</td>
                            </tr>
                        </React.Fragment>
                    )
                }

                if(submittedPassword === "failure"){
                    setTimeout(() => {
                        this.setState({
                            submittedPassword: "", 
                            newPassword: "",
                            confirmNewPassword: ""
                        });
                    }, 3000);
                    return(
                        <tr>
                            <td className="row1"></td>
                            <td>Password does not match in both fields. Please try again.</td>
                        </tr>
                    )
                }else if(submittedPassword === "success"){
                    setTimeout(() => {
                        this.setState({
                            changingPassword: false,
                            submittedPassword: "", 
                            newPassword: "", 
                            enteredPassword: "", 
                            confirmNewPassword: "",
                            validated: {}
                        });
                    }, 3000);
                    return(
                        <tr>
                            <td className="row1"></td>
                            <td>Password changed!</td>
                        </tr>
                    )
                }else if(submittedPassword === ""){
                    return(
                        <React.Fragment>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>Current Password: </label>
                                    <input type="password" 
                                    onChange={this.onChange("enteredPassword")} 
                                    value={enteredPassword}/>
                                </td>
                            </tr>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>New Password: </label>
                                    <input type="password" 
                                    onChange={this.onChange("newPassword")} 
                                    value={newPassword}/>
                                </td>
                            </tr>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <label>Confirm New Password: </label>
                                    <input type="password"
                                    onChange={this.onChange("confirmNewPassword")}
                                    value={confirmNewPassword}/>
                                </td>
                            </tr>
                            <tr>
                                <td className="row1"></td>
                                <td>
                                    <button onClick={this.submitPasswordChange}>Change Password</button>
                                </td>
                            </tr>
                        </React.Fragment>
                    )
                }
            }else{
                return(
                    <React.Fragment>
                        <tr>
                            <td className="row1"></td>
                            <td>
                                <label>Current Password: </label>
                                <input type="password" onChange={this.onChange("enteredPassword")} value={enteredPassword}/>
                                <button onClick={this.submitCurrentPassword}>Submit Password</button>
                            </td>
                        </tr>
                    </React.Fragment>
                )
            }
        }
    }

    onClickFavorite = () => {
        this.state.changingFavorite ?
        this.setState({changingFavorite: false}) :
        this.setState({changingFavorite: true})
    }

    submitFavoriteChange = () => {
        const {_id} = this.props.currentUser;
        const {userInput} = this.state;
        if(userInput === ""){
            this.setState({submittedFavorite: "failure"});
        }else {
            var reformattedName = userInput.toLowerCase().replace(" ", "-")
            .replace("(", "").replace(")", "").replace("alolan", "alola").replace(" ", "");
            console.log(reformattedName);
            axios.post(`/api/users/update/favorite/${_id}`, {
                favorite: reformattedName
            }).then(res => {
                console.log(res);
                this.setState({submittedFavorite: "success"});
            });
            axios.get(`/api/users/${_id}`).then(res => {
                this.props.setCurrentUser(res.data);
            });
        }
    }

    renderChangeFavorite = () => {
        const {changingFavorite, userInput, submittedFavorite} = this.state;
        if(changingFavorite){
            if(submittedFavorite === "failure"){
                setTimeout(() => {
                    this.setState({
                        submittedFavorite: "",
                        changingFavorite: false
                    });
                }, 3000);
                return(
                    <tr>
                        <td className="row1"></td>
                        <td>Please enter a Pokemon before submitting.</td>
                    </tr>
                )
            }else if(submittedFavorite === "success"){
                setTimeout(() => {
                    this.setState({
                        submittedFavorite: "",
                        userInput: "",
                        changingFavorite: false
                    });
                }, 3000);
                return(
                    <tr>
                        <td className="row1"></td>
                        <td>Favorite Pokemon updated!</td>
                    </tr>
                )
            }else if(submittedFavorite === ""){
                return(
                    <React.Fragment>
                    <tr>
                        <td className="row1"></td>
                        <td>
                            <input
                                type="text"
                                onChange={this.onChange("favorite")}
                                onKeyDown={this.onKeyDownFavorite}
                                value={userInput}
                            />
                            {this.renderSuggestionsListComponent()}
                        </td>
                    </tr>
                    <tr>
                        <td className="row1"></td>
                        <td>
                            <button onClick={this.submitFavoriteChange}>Change Favorite</button>
                        </td>
                    </tr>
                    </React.Fragment>
                )
            }
        }
    }

    renderSuggestionsListComponent = () => {
        const {showSuggestions, userInput, filteredSuggestions, activeSuggestion} = this.state;
        if (showSuggestions && userInput && filteredSuggestions.length){
            return(
                <ul className="suggestions">
                      {filteredSuggestions.map((suggestion, index) => {
                        let className;
          
                        // Flag the active suggestion with a class
                        if (index === activeSuggestion) {
                          className = "suggestion_active";
                        }
                        return (
                          <li className={className} key={suggestion} onClick={this.onClickFavoriteSuggestion}>
                            {suggestion}
                          </li>
                        );
                      })}
                </ul>
            )
        }
    }

    getFavoriteName = () => {
        const {favorite} = this.props.currentUser;
        if(favorite){
            if(favorite.includes("default")){
                return "none";
            }else{
                return (
                    favorite.split('-')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' ').replace("Alola", "(Alolan)")
                );
            }
        }
    }

    render() {
        const {currentUser} = this.props;

        return (
            <div className="accountpage">
                <Link className="profilebackBtn" to="/profile">{"< Back"}</Link>
                <h3>Account Info</h3>
                <table>
                    <tbody>
                        <tr>
                            <td className="row1">Username: </td>
                            <td>{currentUser.username}</td>
                        </tr>
                        <tr>
                            <td>Email: </td>
                            <td>{currentUser.email}</td>
                        </tr>
                        <tr>
                            <td className="row1"></td>
                            <td>
                                <button onClick={this.onClickEmail}>Change Email</button>
                            </td>
                        </tr>
                        {this.renderChangeEmail()}
                        <tr>
                            <td className="row1">Password: </td>
                            <td>
                                <button onClick={this.onClickPassword}>Change Password</button>
                            </td>
                        </tr>
                        {this.renderChangePassword()}
                        <tr>
                            <td className="row1">Favorite<br/>Pokemon: </td>
                            <td>{this.getFavoriteName()}</td>
                        </tr>
                        <tr>
                            <td className="row1"></td>
                            <td>
                                <button onClick={this.onClickFavorite}>Change Favorite</button>
                            </td>
                        </tr>
                        {this.renderChangeFavorite()}
                    </tbody>
                </table>
                <br/>
            </div>
        )
    }
}

export default  Account;