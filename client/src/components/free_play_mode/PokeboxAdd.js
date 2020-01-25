import React, { Component } from 'react';
import axios from 'axios';

class PokeboxAdd extends Component {
    state = {
        // The active selection's index
        activeSuggestion: 0,
        // The suggestions that match the user's input
        filteredSuggestions: [],
        // Whether or not the suggestion list is shown
        showSuggestions: false,
        // What the user has entered
        userInput: "",
        selectedPokemon: {},
        addToBox: {},
        cpms: [0.094, 0.135137432, 0.16639787, 0.192650919, 0.21573247, 0.236572661, 0.25572005, 0.273530381,
            0.29024988, 0.306057378, 0.3210876, 0.335445036, 0.34921268, 0.362457751, 0.3752356, 0.387592416,
            0.39956728, 0.411193551, 0.4225, 0.432926409, 0.44310755, 0.453059959, 0.4627984, 0.472336093,
            0.48168495, 0.4908558, 0.49985844, 0.508701765, 0.51739395, 0.525942511, 0.5343543, 0.542635738,
            0.5507927, 0.558830586, 0.5667545, 0.574569133, 0.5822789, 0.589887907, 0.5974, 0.604823665,
            0.6121573, 0.619404122, 0.6265671, 0.633649143, 0.64065295, 0.647580967, 0.65443563, 0.661219252,
            0.667934, 0.674581896, 0.6811649, 0.687684904, 0.69414365, 0.70054287, 0.7068842, 0.713169109,
            0.7193991, 0.725575614, 0.7317, 0.734741009, 0.7377695, 0.740785594, 0.74378943, 0.746781211,
            0.74976104, 0.752729087, 0.7556855, 0.758630368, 0.76156384, 0.764486065, 0.76739717,
            0.770297266, 0.7731865, 0.776064962, 0.77893275, 0.781790055, 0.784637, 0.787473608, 0.7903],
        ivValues: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        levelValues: []
    }

    componentDidMount(){
        this.setState({levelValues: this.setLevelValues()})
    }

    setLevelValues = () => {
        var levelVals = [];
        for(var i=2; i <= 80; i++) {
            levelVals.push(i / 2);
        }
        return levelVals;
    }

    // Event fired when the input value is changed
    onChange = e => {
        const { suggestions } = this.props;
        const userInput = e.currentTarget.value;

        // Filter our suggestions that don't contain the user's input
        
        const filteredSuggestions = suggestions.filter(
        suggestion => {
            return suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        });

        // Update the user input and filtered suggestions, reset the active
        // suggestion and make sure the suggestions are shown
        this.setState({
        activeSuggestion: 0,
        filteredSuggestions,
        showSuggestions: true,
        userInput: e.currentTarget.value
        });
    }

    setFields = name => {
        const {pokemon} = this.props;
        for(var i=0; i<pokemon.length; i++){
            if(pokemon[i].speciesName === name){
                console.log('success');
                return pokemon[i];
            }
        }
    }

    // Event fired when the user clicks on a suggestion
    onClick = e => {
        // Update the user input and reset the rest of the state
        const selected = this.setFields(e.currentTarget.innerText);
        this.setState({
        activeSuggestion: 0,
        filteredSuggestions: [],
        showSuggestions: false,
        userInput: e.currentTarget.innerText,
        selectedPokemon: selected
        });
        const selectedIVs = selected.defaultIVs.cp1500;
        const cpm = this.state.cpms[(selectedIVs[0] - 1) * 2];
        const selectedHP = Math.floor((selected.baseStats.hp + selectedIVs[3]) * cpm);
        const selectedAtk = (selected.baseStats.atk + selectedIVs[1]) * cpm;
        const selectedDef = (selected.baseStats.def + selectedIVs[2]) * cpm;
        this.setState({
            addToBox: {
                speciesName: selected.speciesName,
                speciesId: selected.speciesId,
                stats: {
                    atk: selectedAtk,
                    def: selectedDef,
                    maxhp: selectedHP
                },
                types: selected.types,
                IVs: selected.defaultIVs.cp1500,
                cp: Math.floor((selected.baseStats.atk + selected.defaultIVs.cp1500[1])
                    * Math.sqrt(selected.baseStats.def + selected.defaultIVs.cp1500[2])
                    * Math.sqrt(selected.baseStats.hp + selected.defaultIVs.cp1500[3])
                    * this.state.cpms[(selected.defaultIVs.cp1500[0] - 1) * 2]
                    * this.state.cpms[(selected.defaultIVs.cp1500[0] - 1) * 2] * 0.1)
            }
        });
    }

    // Event fired when the user presses a key down
    onKeyDown = e => {
        const { activeSuggestion, filteredSuggestions } = this.state;

        // User pressed the enter key, update the input and close the
        // suggestions
        if (e.keyCode === 13) {
            const selected = this.setFields(filteredSuggestions[activeSuggestion]);
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion],
                selectedPokemon: selected
            });
            if(selected){
                const selectedIVs = selected.defaultIVs.cp1500;
                const cpm = this.state.cpms[(selectedIVs[0] - 1) * 2];
                const selectedHP = Math.floor((selected.baseStats.hp + selectedIVs[3]) * cpm);
                const selectedAtk = (selected.baseStats.atk + selectedIVs[1]) * cpm;
                const selectedDef = (selected.baseStats.def + selectedIVs[2]) * cpm;
                this.setState({
                    addToBox: {
                        speciesName: selected.speciesName,
                        speciesId: selected.speciesId,
                        stats: {
                            atk: selectedAtk,
                            def: selectedDef,
                            maxhp: selectedHP
                        },
                        types: selected.types,
                        IVs: selected.defaultIVs.cp1500,
                        cp: Math.floor((selected.baseStats.atk + selected.defaultIVs.cp1500[1])
                            * Math.sqrt(selected.baseStats.def + selected.defaultIVs.cp1500[2])
                            * Math.sqrt(selected.baseStats.hp + selected.defaultIVs.cp1500[3])
                            * this.state.cpms[(selected.defaultIVs.cp1500[0] - 1) * 2]
                            * this.state.cpms[(selected.defaultIVs.cp1500[0] - 1) * 2] * 0.1)
                    }
                });
            }
        }
        // User pressed the up arrow, decrement the index
        else if (e.keyCode === 38) {
        if (activeSuggestion === 0) {
            return;
        }

        this.setState({ activeSuggestion: activeSuggestion - 1 });
        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
        if (activeSuggestion - 1 === filteredSuggestions.length) {
            return;
        }

        this.setState({ activeSuggestion: activeSuggestion + 1 });
        }
    }

    toTitleCase = (text) => {
        return (
            text.toLowerCase()
            .split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')
        );
    }

    calcCP = () => {
        const {selectedPokemon, cpms, addToBox} = this.state;
        const bs = selectedPokemon.baseStats;
        const cpm = cpms[(this.state.addToBox.IVs[0] - 1) * 2];
        const atk = addToBox.IVs[1];
        const def = addToBox.IVs[2];
        const hp = addToBox.IVs[3];
        const cp = (bs.atk + atk) * Math.sqrt(bs.def + def) * Math.sqrt(bs.hp + hp) * cpm * cpm * 0.1;
        //console.log("calccp: " + g.speciesId + " " + Math.floor(cp));
        return Math.floor(cp);
    }    

    handleChange = (input) => e => {
        if(input === 'fastMove' || input === 'chargedMove1' || input === 'chargedMove2') {
            axios.get(`/api/moves/${e.target.value}`).then(res => {
                this.setState({
                    addToBox: {...this.state.addToBox, [input]: res.data}
                });
            });
        }
        else {
            this.setState({
                addToBox: {...this.state.addToBox, [input]: e.target.value}
            });
        }
    }

    IVChange = (index) => e => {
        var newVals = this.state.addToBox.IVs;
        if(index === 0){
            newVals[index] = parseFloat(e.target.value);
        }
        else{
            newVals[index] = parseInt(e.target.value);
        }
        this.setState({
            addToBox: {...this.state.addToBox, IVs: newVals}
        });
        const selected = this.state.selectedPokemon;
        const ivs = this.state.addToBox.IVs;
        const cpm = this.state.cpms[(ivs[0] - 1) * 2];
        const newHP = Math.floor((selected.baseStats.hp + ivs[3]) * cpm);
        const newAtk = (selected.baseStats.atk + ivs[1]) * cpm;
        const newDef = (selected.baseStats.def + ivs[2]) * cpm;
        this.setState({
            addToBox: {...this.state.addToBox, stats: {
                atk: newAtk,
                def: newDef,
                maxhp: newHP
            }, cp: this.calcCP()}
        });
    }

    renderConfirmAdd = () => {
        const {addToBox} = this.state;
        if(addToBox.fastMove && addToBox.chargedMove1){
            return(
                <button className="choiceBtn" onClick={this.onConfirmAdd}>Confirm</button>
            )
        }
        else{
            return null
        }
    }

    onConfirmAdd = () => {
        console.log('add to box');
        const {addToBox} = this.state;
        const thisUserId = this.props.thisUserId
        axios.post(`/api/users/update/addbox/${thisUserId}`, addToBox)
        .then(res => {
            console.log(res);
            if(res.status === 200) {
                this.setState({
                    selectedPokemon: {},
                    addToBox: {},
                    activeSuggestion: 0,
                    userInput: ""
                });
                this.props.pokemonAddedToBox();
            }
        });
    }

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
              activeSuggestion,
              filteredSuggestions,
              showSuggestions,
              userInput,
              selectedPokemon,
              addToBox,
              ivValues,
              levelValues
            }
          } = this;
      
          let suggestionsListComponent;//render the pokemon selection input-------------------------------------------
      
          if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
              suggestionsListComponent = (
                <ul className="suggestions">
                  {filteredSuggestions.map((suggestion, index) => {
                    let className;
      
                    // Flag the active suggestion with a class
                    if (index === activeSuggestion) {
                      className = "suggestion_active";
                    }
      
                    return (
                      <li className={className} key={suggestion} onClick={onClick}>
                        {suggestion}
                      </li>
                    );
                  })}
                </ul>
              );
            } else {
              suggestionsListComponent = (
                <div className="no_suggestions">
                </div>
              );
            }
          }

          let selectedPokemonInfo; //render the fields for the selected pokemon------------------------------------

          if(selectedPokemon && selectedPokemon.speciesName && addToBox.speciesName){
              selectedPokemonInfo = (
                <React.Fragment>
                    <label id="cp">CP: {this.calcCP()}</label>
                    <label id="types">
                        Types: {selectedPokemon.types[0]} {selectedPokemon.types[1] !== "none" ? selectedPokemon.types[1] : ""}
                    </label>
                    <br/>
                    <label id="fast_move">Fast Move:</label>
                    <select name="fast_moves" onChange={this.handleChange('fastMove')}>
                        <option></option>
                        {selectedPokemon.fastMoves.map(move => (
                            <option key={move} value={move}>{this.toTitleCase(move)}</option>
                        ))}
                    </select>
                    <br/>
                    <label id="charged_moves">Charged Moves:</label>
                    <select name="charged_move1" onChange={this.handleChange('chargedMove1')}>
                        <option></option>
                        {selectedPokemon.chargedMoves.map(move => (
                            <option key={move} value={move}>{this.toTitleCase(move)}</option>
                        ))}
                    </select>
                    <select name="charged_move2" onChange={this.handleChange('chargedMove2')}>
                        <option></option>
                        {selectedPokemon.chargedMoves.map(move => (
                            <option key={move} value={move}>{this.toTitleCase(move)}</option>
                        ))}
                    </select><br/>
                    <label id="level">Level: </label>
                    <select name="level" value={selectedPokemon.defaultIVs.cp1500[0]} onChange={this.IVChange(0)}>
                        {levelValues.map(val => (
                            <option key={Math.random()} value={val}>{val}</option>
                        ))}
                    </select>
                    <br/>
                    <label id="IVs">IVs:</label><br/>
                    <label id="atk">Attack: </label>
                    <select name="atk" value={selectedPokemon.defaultIVs.cp1500[1]} onChange={this.IVChange(1)}>
                        {ivValues.map(val => (
                            <option key={Math.random()} value={val}>{val}</option>
                        ))}
                    </select><br/>
                    <label id="def">Defense: </label>
                    <select name="def" value={selectedPokemon.defaultIVs.cp1500[2]} onChange={this.IVChange(2)}>
                        {ivValues.map(val => (
                            <option key={Math.random()} value={val}>{val}</option>
                        ))}
                    </select><br/>
                    <label id="hp">HP: </label>
                    <select name="hp" value={selectedPokemon.defaultIVs.cp1500[3]} onChange={this.IVChange(3)}>
                        {ivValues.map(val => (
                            <option key={Math.random()} value={val}>{val}</option>
                        ))}
                    </select><br/>
                    <br/>
                    {this.renderConfirmAdd()}
                </React.Fragment>
              );
          } else{
            selectedPokemonInfo = (
                  <p>Please select a Pokemon.</p>
              )
          }
      
          return (
              <div className="pokeboxadd">
                    <div className="inputname">
                        <table>
                            <tbody>
                                <tr>
                                    <td><label>Pokemon: </label></td>
                                    <td>
                                        <input
                                            type="text"
                                            onChange={onChange}
                                            onKeyDown={onKeyDown}
                                            value={userInput}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>{suggestionsListComponent}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="selectedinfo">
                        {selectedPokemonInfo}
                    </div>
              </div>
          );
    }
}

export default PokeboxAdd;
