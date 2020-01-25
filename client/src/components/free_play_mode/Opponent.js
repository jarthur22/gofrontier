import React, { Component } from 'react';
import axios from 'axios';

class Opponent extends Component {
    state = {
        challenging: false,
        challengeSent: false
    }

    componentDidMount() {

    }

    sendChallenge = (friend) => {
        const {currentUser} = this.props.battleData;
        axios.post(`/api/users/battle/send/${friend._id}`, {
            friend:{
                _id: currentUser._id,
                username: currentUser.username
            },
            league: this.props.battleData.league,
            socketId: this.props.battleData.socket.id
        }).then(res => {
            console.log(res);
            this.props.setPrivacyPacket({
                status: true,
                awaiting1: currentUser._id,
                awaiting2: friend._id
            });
            this.props.setPrivacyPacket({
                status: true,
                awaiting1: currentUser._id,
                awaiting2: friend._id
            });
            this.setState({challengeSent: true});
            this.props.setFriend(friend);
        });
    }

    renderFriendList = () => {
        const {_id, friends} = this.props.battleData.currentUser;
        const {challenging} = this.state;
        if(_id && friends.length > 0 && challenging){
            return(
                <ul className="friends">
                      {friends.map(friend => { //{this.state.onlineFriends.map(friend => {
                            return(
                                <li key={friend._id}>
                                    <button className="friendItem" onClick={() => this.sendChallenge(friend)} style={{height: "55px", width: "200px", textAlign: "center"}}>
                                        <div className="profile">
                                            <img alt="" src={`${process.env.PUBLIC_URL}/defaultprofile/pokeball.png`}/><br/>
                                        </div>
                                        <div className="info">
                                            {friend.username}
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                </ul>
            )
        }
    }

    render() {

        //receive socket that other player has responded, move on to pick team (nextStep)
        const {socket} = this.props.battleData;
        if(socket.id){
            socket.on('challengeaccepted', () => {
                this.props.toPokebox();
            });
        }
        

        if(this.state.challengeSent){
            return(
                <div className="opponent">
                    <p>Challenge sent. Waiting for opponent...</p>
                </div>
            )
        }else{
            return (
                <div className="opponent"> 
                    <h3>Choose Your Opponent</h3>
                    <button className="choiceBtn" onClick={this.props.nextStep}>Battle Random User</button>
                    <br/>
                    <button className="choiceBtn" onClick={() => this.setState({challenging: !this.state.challenging})}>Challenge A Friend</button>
                    <br/>
                    {this.renderFriendList()}                    
                </div>
            )
        }
    }
}

export default Opponent;
