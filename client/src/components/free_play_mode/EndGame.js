import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class EndGame extends Component {
    _isMounted = false;
    gotResults = false;
    state = {
        updateTimestamp: Date.now(),
        desynced: false
    }

    componentDidMount() {
        this._isMounted = true;
        setInterval(() => this.updateInterval(), 1000)
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateInterval = () => {
        if(this._isMounted && !this.gotResults && this.props.id){
            this.setState({updateTimestamp: Date.now()});
            if(window.localStorage.getItem(`afktimer${this.props.id}`)){
                var afktimer = window.localStorage.getItem(`afktimer${this.props.id}`);
                if(this.state.updateTimestamp - afktimer > 3000){
                    this.setState({desynced: true});   
                }
            }
        }
    }

    newBattle = () => {
        window.localStorage.clear();
        this.props.resetStep();
    }

    render() {
        if(!window.localStorage.getItem("winner")){
            if(this.state.desynced){
                return(
                    <div className="endGame">
                        <h2>Connection with battle has been lost.</h2>
                        <div>
                            <button className="choiceBtn" onClick={this.newBattle}>Battle Again</button>
                            <Link className="choiceBtn" to="/">Back to Home</Link>
                        </div>
                    </div>
                )
            }

            return(
                <div className="endGame">
                    <h2>Waiting for match results...</h2>
                    
                </div>
            )
        }else{
            this.gotResults = true;
            if(window.localStorage.getItem("winner") === this.props.id){
                return(
                    <div className="endGame">
                        <h2>You won!</h2>
                        <div>
                            <button className="choiceBtn" onClick={this.newBattle}>Battle Again</button>
                            <Link className="choiceBtn" to="/">Back to Home</Link>
                        </div>
                    </div>
                )
            }else{
                return(
                    <div className="endGame">
                        <h2>Good effort!</h2>
                        <div>
                            <button className="choiceBtn" onClick={this.newBattle}>Battle Again</button>
                            <Link className="choiceBtn" to="/">Back to Home</Link>
                        </div>
                    </div>
                )
            }
        }
    }
}

export default EndGame;