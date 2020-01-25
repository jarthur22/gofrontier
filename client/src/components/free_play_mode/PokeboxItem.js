import React, { Component } from 'react'
import '../../App.css';

class PokeboxItem extends Component {

    onClick = () => {
        this.props.onPokemonSelect(this.props.item)
    }

    render() {
        const {speciesName} = this.props.item;
        const spriteURL = this.props.item.speciesId.replace("_", "-").replace("alolan", "alola");
        //const baseStats = this.props.item.baseStats;
        //const types = this.props.item.types;
        const fastMove = this.props.item.fastMove.name;
        const chargedMove1 = this.props.item.chargedMove1.name;
        const chargedMove2 = this.props.item.chargedMove2.name;
        const {cp} = this.props.item;
        //const IVs = this.props.item.IVs;
        return (
            <div className="pokeboxitem">
                <button className="pokeboxitemBtn" onClick={this.onClick}>
                    <div className="sprite">
                        <img alt=""  src={`${process.env.PUBLIC_URL}/sprites/${spriteURL}.png`} style={{width: '70px'}}/><br/>
                        {speciesName}
                    </div>
                    <div className="info">
                        <table>
                            <tbody>
                                <tr>
                                    <td>CP:</td>
                                    <td>{cp}</td>
                                </tr>
                                <tr>
                                    <td>Fast:</td>
                                    <td>{fastMove}</td>
                                </tr>
                                <tr>
                                    <td style={{width: '60px'}}>Charged:</td>
                                    <td>{chargedMove1}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>{chargedMove2}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </button>
            </div>
            
        )
    }
}

export default PokeboxItem;
