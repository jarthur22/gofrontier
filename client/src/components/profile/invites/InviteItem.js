import React, { Component } from 'react';
import axios from 'axios';

class InviteItem extends Component {
    _isMounted = false;
    state = {
        profile: `${process.env.PUBLIC_URL}/question.png`
    }

    componentDidMount() {
        this._isMounted = true;
        const {_id} = this.props.challenge.friend;
        axios.get(`/api/users/favorite/${_id}`).then(res => {
            console.log(res);
            if(this._isMounted)
                this.setState({
                    profile: res.data.includes('default') ?
                        `${process.env.PUBLIC_URL}/defaultprofile/${res.data}.png` :
                        `${process.env.PUBLIC_URL}/sprites/${res.data}.png`
                });
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const {challenge} = this.props;
        const {profile} = this.state;
        return (
            <div className="frienditem" id={challenge.friend.username}>
                <img alt="profile" src={profile} style={{width: '70px'}}/>
                <label>{challenge.friend.username}</label>
                <div className="buttons">
                    <button className="choiceBtn" onClick={() => this.props.acceptChallenge(challenge)}>Accept</button>
                    <button className="choiceBtn" onClick={() => this.props.denyChallenge(challenge)}>Deny</button>
                </div>
            </div>
        )
    }
}

export default InviteItem;