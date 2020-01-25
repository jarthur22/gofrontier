import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import FriendItem from './FriendItem';
import AddFriend from './AddFriend';
import FriendRequests from './FriendRequests';
import axios from 'axios';

export default class Friends extends Component {
    _isMounted = false;

    state = {
        tab: 1,
        statusText: ""
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    goToAdd = () => {
        this.setState({tab: 0});
    }

    goToFriends = () => {
        this.setState({tab: 1});
    }

    goToRequests = () => {
        this.setState({tab: 2});
    }

    removeFriend = (friend) => {
        const {_id} = this.props.currentUser;
        axios.post(`/api/users/friends/remove/${_id}`, friend).then(res => {
            console.log(res);
            axios.get(`/api/users/friends/${_id}`).then(res1 => {
                this.props.updateFriendList(res1.data);
            });
            this.setState({statusText: "Friend removed from list."});
            setTimeout(() => {
                if(this._isMounted)
                    this.setState({statusText: ""});
            }, 3000);
        });
    }

    render() {
        const {_id, username, friends, requests} = this.props.currentUser;
        const {tab, statusText} = this.state;
        const requestData = {_id, username};

        switch(tab){
            case 0:
                return (
                    <div className="friends">
                        <Link className="profilebackBtn" to="/profile">{"< Back "}</Link>
                        <h3>{username}'s Friends</h3>
                        <div className="friendnavigate">
                            <button className="choiceBtn" onClick={this.goToAdd}>Add Friend</button>
                            <button className="choiceBtn"onClick={this.goToFriends}>See Friends</button>
                            <button className="choiceBtn"onClick={this.goToRequests}>Requests</button>
                        </div><br/>
                        <AddFriend username={username} friends={friends} requestData={requestData}/>
                    </div>
                )
            case 1:
                if(friends.length === 0){
                    return(
                        <div className="friends">
                            <Link className="profilebackBtn" to="/profile">{"< Back "}</Link>
                            <h3>{username}'s Friends</h3>
                            <div className="friendnavigate">
                                <button className="choiceBtn" onClick={this.goToAdd}>Add Friend</button>
                                <button className="choiceBtn"onClick={this.goToFriends}>See Friends</button>
                                <button className="choiceBtn"onClick={this.goToRequests}>Requests</button>
                            </div><br/>
                            <p>You have no friends in your list. Add some friends!</p>
                        </div>
                    )
                }
                else {
                    return(
                        <div className="friends">
                            <Link className="profilebackBtn" to="/profile">{"< Back "}</Link>
                            <h3>{username}'s Friends</h3>
                            <div className="friendnavigate">
                                <button className="choiceBtn" onClick={this.goToAdd}>Add Friend</button>
                                <button className="choiceBtn"onClick={this.goToFriends}>See Friends</button>
                                <button className="choiceBtn"onClick={this.goToRequests}>Requests</button>
                            </div><br/>
                            <p>{statusText}</p>
                            <div className="friendlist">
                                {friends.map((friend) => (
                                    <FriendItem key={Math.random()}
                                    friend={friend}
                                    removeFriend={this.removeFriend}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }
            case 2:
                if(requests.length === 0){
                    return(
                        <div className="friends">
                            <Link className="profilebackBtn" to="/profile">{"< Back "}</Link>
                            <h3>{username}'s Friends</h3>
                            <div className="friendnavigate">
                                <button className="choiceBtn" onClick={this.goToAdd}>Add Friend</button>
                                <button className="choiceBtn"onClick={this.goToFriends}>See Friends</button>
                                <button className="choiceBtn"onClick={this.goToRequests}>Requests</button>
                            </div><br/>
                            <p>You have no pending friend requests.</p>
                        </div>
                    )
                }
                else{
                    return(
                        <div className="friends">
                            <Link className="profilebackBtn" to="/profile">{"< Back "}</Link>
                            <h3>{username}'s Friends</h3>
                            <div className="friendnavigate">
                                <button className="choiceBtn" onClick={this.goToAdd}>Add Friend</button>
                                <button className="choiceBtn"onClick={this.goToFriends}>See Friends</button>
                                <button className="choiceBtn"onClick={this.goToRequests}>Requests</button>
                            </div><br/>
                            <div className="friendrequests">
                                <FriendRequests 
                                    requests={requests} 
                                    _id={_id}
                                    updateFriendRequests={this.props.updateFriendRequests}
                                    updateFriendList={this.props.updateFriendList}
                                />
                            </div>
                        </div>
                    )
                }
            default:
                return(
                    <p>Something went wrong.</p>
                )
        }
    }
}
