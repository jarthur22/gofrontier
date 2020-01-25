import React, {Component} from 'react';
import axios from 'axios';
import '../../App.css';

class ConfirmTeam extends Component {

    continue = e => {
        e.preventDefault();
        //this.props.addFinalBattleData();
        this.props.nextStep();
    }

    back = e => {
        e.preventDefault();
        this.props.prevStep();
    }

    sendSocket = () => {
        window.localStorage.setItem('battleData', JSON.stringify({
            league: this.props.battleData.league,
            team: this.props.battleData.team,
            currentUser: this.props.battleData.currentUser
        }));
        axios.post('/api/socket/store', {socket: this.props.battleData.socket.id}).then(res => {
            if(res.status === 200){
                console.log("success!");
                this.navigate(`${process.env.PUBLIC_URL}/battle.html`);
            }
        })
    }

    navigate = (href) => {
        var a = document.createElement('a');
        a.href = href;
        a.target = "_blank"
        a.click();
     }


    render() {
        const {battleData: {team, league}} = this.props;

        return(
            <div className="confirmTeam">
                <p>Is this the team you want to use?</p>
                <div className="confirmData" >
                    <p>League: <img alt="League Icon" src={`${process.env.PUBLIC_URL}/${league}.png`} style={{width: '70px'}}/></p><br/>
                    <div className="team" style={{display: 'inline'}}>
                        {team.map((mon) => (
                            <React.Fragment key={Math.random()}><img alt="" src={
                                `${process.env.PUBLIC_URL}/sprites/${
                                    mon.speciesId.replace("_", "-").replace("alolan", "alola")
                                    }.png`
                                } style={{width: '70px'}}/></React.Fragment>
                        ))}
                    </div>
                </div>

                <button className="choiceBtn" onClick={this.sendSocket}>Let's GO!</button>
                {/* <a  className="choiceBtn" href={`${process.env.PUBLIC_URL}/battle.html`}>Lets GO!</a> */}
                <button className="choiceBtn" onClick={this.back}>Go Back</button>
            </div>
        )
    }
}

export default ConfirmTeam;