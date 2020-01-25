import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import ProfileNavigate from './ProfileNavigate';
import Friends from './friends/Friends';
import Invites from './invites/Invites';
import Account from './account/Account';

class Profile extends Component {
    state = {
        redirectFreePlay: false
    }

    redirectToFreeplay = () => {
        console.log('redirecting...');
        this.setState({redirectFreePlay: true});
    }

    render() {
        const {currentUser, profileSRC} = this.props;

        if(this.state.redirectFreePlay){
            return(
                <Redirect to="/freeplay"/>
            )
        }
        if(currentUser._id){
        
            return (
                <Router>
                     <div className="Profile">
                        <div className="profileheader">
                            <img alt="profile" src={profileSRC}/>
                            {currentUser.username}'s Profile
                        </div>
                        <Switch>
                            <Route exact path="/profile" render={(props) => <ProfileNavigate {...props} currentUser={currentUser}/>}/>
                            <Route path="/profile/friends" render={(props) =>
                                <Friends {...props} 
                                    currentUser={currentUser}
                                    updateFriendRequests={this.props.updateFriendRequests}
                                    updateFriendList={this.props.updateFriendList}
                                />}/>
                            <Route path="/profile/invites" render={(props) => 
                                <Invites {...props}
                                    currentUser={currentUser}
                                    setCurrentUser={this.props.setCurrentUser}
                                    challengeAccepted={this.props.challengeAccepted}
                                    redirectToFreeplay={this.redirectToFreeplay}
                                />}/>
                            <Route path="/profile/account" render={(props) => 
                                <Account {...props}
                                    currentUser={currentUser}
                                    profileSRC={profileSRC}
                                    setCurrentUser={this.props.setCurrentUser}
                                />}/>
                        </Switch>
                        
                    </div>
                </Router>
            )
        }
        else {
            return <Redirect to="/login"/>
        }
    }
}

export default Profile;