const fs = require('fs');
const path = require('path');
const gamemaster = require('./gamemaster.json');
//const axios = require('axios');

fs.writeFile(path.join(__dirname, '/', 'pokemon.json'), JSON.stringify(gamemaster.pokemon, null, 2), 'utf-8' ,(err) => {
    if(err) throw err;
    console.log('File written to pokemon.json.');
});

fs.writeFile(path.join(__dirname, '/', 'cups.json'), JSON.stringify(gamemaster.cups, null, 2), 'utf-8' ,(err) => {
    if(err) throw err;
    console.log('File written to cups.json.');
});

fs.writeFile(path.join(__dirname, '/', 'moves.json'), JSON.stringify(gamemaster.moves, null, 2), 'utf-8' ,(err) => {
    if(err) throw err;
    console.log('File written to moves.json.');
});

//THIS CODE IS NO LONGER USED. FREE TO DELETE.
/* //Pull json data from pokebattler api
axios.get('https://fight.pokebattler.com/pokemon')
.then(res => {
    fs.writeFile(path.join(__dirname, '/', 'pokemon.json'), trimData(res.data.pokemon), 'utf-8' ,(err) => {
        if(err) throw err;
        console.log('File written to...');
    })
});

//Modify pokebattler data
const trimData = (data) => {
    var newData = [];
    for(i=0; i<data.length; i++){
        var obj = data[i];
        var newObj = {};
        for(let prop in obj){
            switch(prop){
                case "pokemonId":
                    newObj.name = obj[prop];
                    break;
                case "type":
                    newObj.types = {};
                    newObj.types.type1 = obj[prop];
                    break;
                case "type2":
                    newObj.types.type2 = obj[prop];
                    break;
                case "stats":
                    newObj.stats = {};
                    newObj.stats.bSta = obj[prop].baseStamina;
                    newObj.stats.bAtk = obj[prop].baseAttack;
                    newObj.stats.bDef = obj[prop].baseDefense;
                    break;
                case "quickMoves":
                    newObj.fastMoves = [];
                    for(x=0; x<obj[prop].length; x++){
                        newObj.fastMoves.push(obj[prop][x]);
                    }
                    break;
                case "cinematicMoves":
                    newObj.chargeMoves = [];
                    for(x=0; x<obj[prop].length; x++){
                        newObj.chargeMoves.push(obj[prop][x]);
                    }
                    break;
                case "form":
                    newObj.form = obj[prop];
            }
        }
        newData.push(newObj);
    }
    return JSON.stringify(newData, null, 2);
} */


