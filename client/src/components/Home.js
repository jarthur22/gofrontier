import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import '../App.css';

class Home extends Component {

    renderWelcomeMessage = () => {
        if(this.props.currentUser._id){
            return (
                <div className="welcomemessage">
                    <h3 className="welcomemessage">Welcome, {this.props.currentUser.username}!</h3>
                    <p>Add friends to battle, or change your profile picture.</p>
                    <Link className="choiceBtn" to="/profile">Go To Profile</Link>
                </div>
               )
        }
        else{
            return(
                <div className="welcomemessage">
                    <h3>Welcome to the Only Platform for Pokemon GO PvP battles on the Web.</h3>
                    <Link className="choiceBtn" to="/login">Log In / Create Account</Link>
                </div>
            )
        }
    }

    render(){
        return(
            <div className="home">
                <h1>GOFrontier</h1>
                <div className="secondarytext">The final frontier for PvP</div>
                <br/>

                {this.renderWelcomeMessage()}<br/>
                <div className="modes">
                    <h2>Battle Modes</h2>
                    <div className="freeplayinfo">
                        <h4> Free Play Mode</h4>
                        <p>Free Play Mode is an exact emulation of the current battle system in Pokemon GO.
                            You choose your opponent (either random or from your GOFrontier friend list),
                            choose your team of 3 from a box of Pokemon that you keep in storage, and GO battle!
                        </p><br/>
                        <Link className="choiceBtn" to="/freeplay">Go To Free Play Mode</Link>
                    </div>
                    <div className="comingsoon">
                        More battle modes coming soon!
                    </div>
                </div>
            </div>
        )
    }
}

export default Home;