import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class ProfileNavigate extends Component {
    render() {
        return (
            <div className="profilenavigate">
                <Link className="profileBtn" to="/profile/friends">Friends</Link>
                <Link className="profileBtn" to="/profile/invites">Invites</Link>
                <Link className="profileBtn" to="/profile/account">Account</Link>
            </div>
        )
    }
}

export default ProfileNavigate;