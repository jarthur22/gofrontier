import React from 'react';
import {Link} from 'react-router-dom';
import '../../App.css';

function Header(props) {
    var {userActive, menuClicked} = props;
    return(
        <header>
            <div className="headerlinks">
                <Link className="link" to="/">Home</Link>
                <Link className="link" to="/freeplay">Free Play Mode</Link>
                <Link className="link" to="/login">{userActive ? "Logout" : "Login"}</Link>
                <Link className="link" to="/profile">Profile</Link>
            </div>
            <div className="hamburgermenu">
                <button className="menuBtn" onClick={menuClicked}>
                    <img src={`${process.env.PUBLIC_URL}/defaultprofile/pokeball.png`} alt="menu"/>
                </button>
            </div>
        </header>
    )
}

export default Header;