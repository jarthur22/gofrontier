import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import Pokebox from './Pokebox';
import ConfirmTeam from './ConfirmTeam';
import Opponent from './Opponent';
import EndGame from '../battle/EndGame';
import '../../App.css';
import openSocket from 'socket.io-client';

class FreePlayMode extends Component {
    _isMounted = false;

    state = {
        socket: window.location.href.includes("heroku") ?
        openSocket(window.location.href.replace("http", "ws")) :
        openSocket('http://localhost:4000/'),
        step: 1,
        team:[],
        league: "Great",
        pokemon: [],
        box: [],
        teamFull: false,
        thisUserId: '5d52ea52d8be8516e0aca6d7', //get this on log in and pull in from props instead of state
        friend: {}
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get('/api/pokemon')
        .then(res => {
            if(res.data.length > 0) {
                if(this._isMounted) this.setState({pokemon: res.data});
            }
        });

        axios.get(`/api/users/${this.props.currentUser._id}`)
        .then(res => {
            if(res.data !== null){
                if(this._isMounted) this.setState({box: res.data.pokebox});
            }
        });
        if(this.props.challenged){
            this.setState({step: 2});
        }
    }

    componentWillUnmount() {
        window.localStorage.clear();
        this._isMounted = false;
        const {socket} = this.state;
        socket.off('lobbypos');
        socket.off('playercount');
        socket.off('lobbycount');
        socket.off('enemychoseteam');
        socket.off('start');
        socket.off('battleconnection');
        socket.off('challengefailed');
        socket.off('connect');
        socket.disconnect();
    }

    //Proceed to next step
    nextStep = () => {
        const {step} = this.state;
        this.setState({
            step: step + 1
        });
    }
    toPokebox = () => {
        this.setState({
            step: 2
        });
    }
    toExpiredRequest = () => {
        this.setState({step: 6});
    }

    //Go back to previous step
    prevStep = () => {
        const {step} = this.state;
        this.setState({
            step: step - 1
        });
    }

    pokemonAddedToBox = () => {
        axios.get(`/api/users/pokebox/${this.props.currentUser._id}`)
        .then(res => {
            if(res.data.length > 0){
                this.setState({box: res.data});
            }
        });
    }

    onPokemonSelect = (item) => {
        const {team, teamFull} = this.state;
        console.log("clicked");
        if(!teamFull){ //Honestly not even 100% sure why this works right, but it does! React state updates are dumb, but yay for intricate conditional loops!
            if(team.some(mon => mon === item)){
                console.log("Already included");
                this.setState({team: team.filter(mon => { 
                    return mon !== item
                })});
                this.setState({teamFull: false});
            }
            else{
                if(team.length > 2){
                    this.setState({teamFull: true});
                }
                else{
                    this.setState({team: [...team, item]});
                }
            }
        }
        else{
            console.log(`Team length exceeded: ${team.length}`);
            this.setState({teamFull: false});
        }
    }

    setFriend = (friend) => {
        this.setState({friend});
    }

    render() {
        var {step, league, pokemon, box, team, socket} = this.state;
        const {currentUser, challenged} = this.props;
        var battleData = {
            league: league,
            team: team,
            currentUser: currentUser,
            socket: socket
        };

        socket.on('connect', () => {
            console.log(socket);
            socket.emit('attachuser', {_id: currentUser._id});
            
        });

        socket.on('attached', () => {
            socket.emit("migrateuser", {});
        });

        if(challenged){
            //emit socket to other player who sent the challenge that we have responded, move on to pick team
            this.props.removeChallengedStatus();
            socket.emit('challengeaccepted', {socketId: this.props.otherSocketId});
        }

        socket.on('challengefailed', () => {
            this.toExpiredRequest();
        });
        
        switch(step) {
            case 1:
                if(currentUser._id){
                    return(
                        <Opponent className="freeplaycomponent"
                            nextStep={this.nextStep}
                            toPokebox={this.toPokebox}
                            setFriend={this.setFriend}
                            setPrivacyPacket={this.props.setPrivacyPacket}
                            battleData={battleData}
                        />
                    )
                } else return <Redirect to="/login"/>
            case 2:
                return(
                    <Pokebox className="freeplaycomponent"
                        prevStep={this.prevStep}
                        nextStep={this.nextStep}
                        battleData={battleData}
                        pokemon={pokemon}
                        box={box}
                        onPokemonSelect={this.onPokemonSelect}
                        pokemonAddedToBox={this.pokemonAddedToBox}
                    />
                )
            case 3:
                /* window.localStorage.setItem('battleData', Flatted.stringify(battleData));
                var testData = Flatted.parse(window.localStorage.getItem('battleData'));
                console.log(testData.socket); */

                /* window.localStorage.setItem('battleData', util.inspect(battleData));
                var testData = JSON.parse(window.localStorage.getItem('battleData'));
                console.log(testData.socket); */

                return(
                    <ConfirmTeam className="freeplaycomponent"
                        nextStep={this.nextStep}
                        prevStep={this.prevStep}
                        battleData={battleData}
                    />
                )
            case 4:
                return(
                    <EndGame className="freeplaycomponent"
                        id={currentUser.username}
                    />
                )
            default:
                return(
                    <p className="freeplaycomponent">Request has expired.</p>
                )
        }
    }
}

export default FreePlayMode;