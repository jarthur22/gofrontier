import React, { Component } from 'react';
import InviteItem from './InviteItem';
import {Link} from 'react-router-dom';
import axios from 'axios';

class Invites extends Component {
    _isMounted = false;
    state = {
        statusText: "",
        challengeAccepted: false
    }

    componentDidMount(){
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    refreshInvites = () => {
        const {_id} = this.props.currentUser;
        axios.get(`/api/users/${_id}`).then(res => {
            this.props.setCurrentUser(res.data);
        });
    }

    acceptChallenge = (challenge) => {
        const {_id} = this.props.currentUser;
        axios.post(`/api/users/battle/accept/${_id}`, challenge).then(res => {
            if(res.status === 200){
                this.props.challengeAccepted(challenge.socketId, {
                    status: true,
                    awaiting1: _id,
                    awaiting2: challenge.friend._id
                });
                this.setState({challengeAccepted: true});
            }
        }).catch(err => console.log(err));
    }

    denyChallenge = (challenge) => {
        const {_id} = this.props.currentUser;
        axios.post(`/api/users/battle/deny/${_id}`, challenge).then(res => {
            if(res.status === 200){
                axios.get(`/api/users/${_id}`).then(res => {
                    this.props.setCurrentUser(res.data);
                }).catch(err => console.log(err));
                this.setState({statusText: "Request deleted."});
                setTimeout(() => {
                    if(this._isMounted)
                        this.setState({statusText: ""});
                }, 3000);
            }
        }).catch(err => console.log(err));
    }

    renderRedirect = () => {
        if(this.state.challengeAccepted){
            this.props.redirectToFreeplay()
        }
    }

    render() {
        const {challenges} = this.props.currentUser;
        const {statusText} = this.state;

        if(challenges.length === 0){
            return(
                <div>
                    <Link className="profilebackBtn" to="/profile">{"< Back"}</Link>
                    <div className="battleinvites">
                        <h3>Battle Invites</h3>
                        <p>You have no pending battle requests. Refresh to try again.</p><br/>
                        <button className="choiceBtn" onClick={this.refreshInvites}>Refresh</button>
                    </div>
                </div>
            )
        }
        return (
            <div>
                {this.renderRedirect()}
                <Link className="profilebackBtn" to="/profile">{"< Back"}</Link>
                
                <div className="battleinvites">
                    <h3>Battle Invites</h3>
                    <p>{statusText}</p>
                    <button className="choiceBtn" onClick={this.refreshInvites}>Refresh</button><br/>
                    <div className="friendlist">
                        {challenges.map(challenge => (
                            <InviteItem key={Math.random()}
                            challenge={challenge}
                            acceptChallenge={this.acceptChallenge}
                            denyChallenge={this.denyChallenge}/>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default Invites;