import React, { Component } from 'react';
import axios from 'axios';

class AddFriend extends Component {
    state = {
        userInput: "",
        searchResults: [],
        errText: ""
    }

    onChange = (input) => e => {
        this.setState({[input]: e.currentTarget.value, searchResults: []});
    }

    onKeyDown = (e) => {
        if(e.keyCode === 13) this.searchUser();
    }

    searchUser = () => {
        this.setState({errText: ""});
        const {username, friends} = this.props;
        const {userInput} = this.state;
        if(userInput === ""){
            this.setState({errText: "Please enter a username."});
            return;
        }
        if(userInput !== username){
            for(var i=0; i<friends.length; i++){
                if(userInput === friends[i].username){
                    this.setState({errText: "This friend already exists in your friend list."});
                    return;
                }
            }
            this.setState({searchResults: [0]});
            axios.get(`/api/users/search/${userInput}`)
            .then(res => {
                if(res.data.length === 0){
                    this.setState({errText: "No users were found with a username like that."});
                    return;
                }
                else{
                    this.setState({searchResults: res.data});
                }
            });
        }
        else{
            this.setState({errText: "You can't add yourself as a friend!"});
            return;
        }
    }

    sendRequest = (id) => {
        axios.post(`/api/users/requests/send/${id}`, this.props.requestData)
        .then(res => {
            console.log(res.data);
            if(res.data._id){
                this.setState({searchResults: [1], errText: ""});
            }
            else if(!res.data.success){
                this.setState({errText: "You have already sent a friend request to this user, or you are already friends."})
            }
        })
    }

    renderResults = () => {
        const {searchResults} = this.state;
        if(searchResults.length > 0){
            if(searchResults[0] === 0){
                return(
                    <div>
                        <p>Searching...</p>
                    </div>
                )
            }
            else if(searchResults[0] === 1){
                return(
                    <div>
                        <p>Friend request sent!</p>
                    </div>
                )
            }
            else{
                return(
                    <div className="friendlist">
                        {this.getResults()}
                    </div>
                )
            }
        }
    }

    getResults = () => {
        const {searchResults} = this.state;
        return(
            searchResults.map((result) => (
                <div className="frienditem" key={Math.random()}>
                    <img alt="profile" src={result.favorite.includes('default') ?
                        `${process.env.PUBLIC_URL}/defaultprofile/${result.favorite}.png` :
                        `${process.env.PUBLIC_URL}/sprites/${result.favorite}.png`}
                        />
                    <label>{result.username}</label>
                    <button className="choiceBtn" onClick={() => this.sendRequest(result._id)}>Send Request</button>
                </div>
            ))
        )
    }

    render() {
        const {userInput, errText} = this.state;

        return (
            <div className="addfriend">
                <p>{errText}</p>
                <label>Search for user by username: </label>
                <input onChange={this.onChange("userInput")} onKeyDown={this.onKeyDown} value={userInput}/>
                <button className="choiceBtn" onClick={this.searchUser}>Search</button>
                {this.renderResults()}
            </div>
        )
    }
}

export default AddFriend;