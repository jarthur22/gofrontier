import React, { Component } from 'react';

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

    render() {
        if(!window.localStorage.getItem("winner")){
            if(this.state.desynced){
                return(
                    <div className="EndGame">
                        <h1>Connection with battle has been lost.</h1>
                    </div>
                )
            }

            return(
                <div className="EndGame">
                    <h1>Waiting for match results...</h1>
                    {this.state.updateTimestamp}
                </div>
            )
        }else{
            this.gotResults = true;
            if(window.localStorage.getItem("winner") === this.props.id){
                //window.localStorage.removeItem("winner");
                //window.localStorage.removeItem("afktimer");
                return(
                    <div className="EndGame">
                        <h1>You won!</h1>
                    </div>
                )
            }else{
                //window.localStorage.removeItem("winner");
                //window.localStorage.removeItem("afktimer");
                return(
                    <div className="EndGame">
                        <h1>You lost!</h1>
                    </div>
                )
            }
        }
    }
}

export default EndGame;