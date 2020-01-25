import React, { Component } from 'react';
import axios from 'axios';

class RequestItem extends Component {
    _isMounted = false;
    state = {
        profile: `${process.env.PUBLIC_URL}/question.png`
    }

    componentDidMount() {
        this._isMounted = true;
        const {_id} = this.props.request;
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
        const {request} = this.props;
        const {profile} = this.state;
        return (
            <div className="frienditem" id={request.username}>
                <img alt="profile" src={profile}/>
                <label>{request.username}</label>
                <button className="choiceBtn" onClick={() => this.props.acceptRequest(request)}>Accept</button>
                <button className="choiceBtn" onClick={() => this.props.denyRequest(request)}>Deny</button>
            </div>
        )
    }
}

export default RequestItem;