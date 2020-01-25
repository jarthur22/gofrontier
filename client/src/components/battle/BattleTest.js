import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';


export default class BattleTest extends Component {


    render() {
        return (
            <div>
                <Redirect to='/battle.html'/>
            </div>
        )
    }
}
