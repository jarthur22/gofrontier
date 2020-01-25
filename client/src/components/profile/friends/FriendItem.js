import React, { Component } from 'react';
import axios from 'axios';

class FriendItem extends Component {
    _isMounted = false;
    state = {
        profile: `${process.env.PUBLIC_URL}/question.png`
    }

    componentDidMount() {
        this._isMounted = true;
        const {_id} = this.props.friend;
        axios.get(`/api/users/favorite/${_id}`).then(res => {
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
        const {username} = this.props.friend;
        const {profile} = this.state;
        return (
            <div className="frienditem">
                <img alt="profile" src={profile}/>
                <div className="friendusername">{username}</div>
                <button className="choiceBtn" onClick={() => this.props.removeFriend(this.props.friend)}>Remove Friend</button>
            </div>
        )
    }
}

export default FriendItem;
