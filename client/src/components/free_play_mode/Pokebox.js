import React, {Component} from 'react';
import '../../App.css';
import PokeboxItem from './PokeboxItem';
import PokeboxAdd from './PokeboxAdd';

class Pokebox extends Component {

    state = {
        tab: 1
    }

    componentDidMount() {
        
    }

    continue = e => {
        e.preventDefault();
        this.props.nextStep();
    }

    goToAdd = () => {
        this.setState({
            tab: 0
        });
    }

    goToChoose = () => {
        this.setState({
            tab: 1
        });
    }

    renderConfirmBtn =() => {
        if(this.props.battleData.team.length > 0){
            return(
                <button className="choiceBtn" onClick={this.continue}>Confirm</button>
            )
        }
        else{
            return null
        }
    }

    
    

    render() {
        var {battleData, box, pokemon} = this.props;
        var {tab} = this.state;
        var suggestions = pokemon.map(mon => {
            return mon.speciesName;
        })

        switch(tab) {
            case 0:
                return(
                    <div className="pokebox">
                        <h3>Add Pokemon to Your Box</h3>
                        <button className="choiceBtn" onClick={this.goToAdd}>Add Pokemon</button>
                        <button className="choiceBtn" onClick={this.goToChoose}>Choose Pokemon</button>
                        <PokeboxAdd
                        pokemon={pokemon}
                        suggestions={suggestions}
                        box={box}
                        pokemonAddedToBox={this.props.pokemonAddedToBox}
                        thisUserId={this.props.battleData.currentUser._id}/>
                    </div>
                )
            case 1:
                if(pokemon.length === 0){
                    return(
                        <div className="pokebox">
                            <p>Loading...</p>
                        </div>
                    )
                }else if(box.length === 0){
                    return(
                        <div className="pokebox">
                            <h3>Choose Your Pokemon</h3>
                            <button className="choiceBtn" onClick={this.goToAdd}>Add Pokemon</button>
                            <button className="choiceBtn" onClick={this.goToChoose}>Choose Pokemon</button>
                            <p>You have no Pokemon in your box. Add some Pokemon!</p><br/>
                            <button className="choiceBtn" onClick={this.goToAdd}>Add Pokemon</button>
                        </div>
                    )
                }
                else{
                    return(
                        <div className="pokebox">
                            <h3>Choose Your Pokemon</h3>
                            <button className="choiceBtn" onClick={this.goToAdd}>Add Pokemon</button>
                            <button className="choiceBtn" onClick={this.goToChoose}>Choose Pokemon</button>
                            <div className="choices">
                                {this.renderConfirmBtn()}
                            </div>
                            <div className="choosingteam">
                                {
                                    battleData.team.map((mon) => (
                                        <div className="teamdisplay" key={Math.random()}>
                                            <img src={
                                                `${process.env.PUBLIC_URL}/sprites/${
                                                    mon.speciesId.replace("_", "-").replace("alolan", "alola")
                                                    }.png`
                                                } alt=""/>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="box" >
                                {box.map((item) => (
                                    <PokeboxItem key={Math.random()}
                                        item={item}
                                        onPokemonSelect={this.props.onPokemonSelect}
                                    />
                                ))}
                            </div>
                            <br/>
                        </div>
                    )
                }
            default:
                    return(
                        <div className="pokebox">
                            <button className="tab add" onClick={this.goToAdd}>Add Pokemon</button>
                            <button className="tab choose" onClick={this.goToChoose}>Choose Pokemon</button>
                            <h1>404 State Error</h1>
                        </div>
                    )
        }

    }
}

export default Pokebox;