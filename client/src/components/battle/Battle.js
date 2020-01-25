import React, { Component } from 'react';
import $ from 'jquery';
//import Gamemaster from './gamemaster';
import '../../App.css';

class Battle extends Component {
    _isMounted = false;
    battleConnected = true;
    currentpoke = 0;
    currentenemypoke = 0;
    switchcd = 0;
    shields = 2;
    oshields = 2;
    move = {moveId: ""};
    opponentshielding = false;
    shielding = false;
    doingcharge = false;
    chargeincoming = false;
    winner = -1;
    turnswaited = 0;
    lock = false;
    afktimer = Date.now();
    energy = [0,0,0];
    oenergy = [0,0,0];
    currentHP = [];
    currentEnemyHP = [];
    boosts = {
        atk: [0,0],
        def: [0,0]
    };
    oboosts = {
        atk: [0,0],
        def: [0,0]
    };
    sentendpacket = false;
    chatlog = ""; //put this in another component
    
    state = {
        started: false,
        enemyteam: [],
        startrecv: false,
        enemyname: ""
    }

    componentDidMount(){
        this._isMounted = true;
        this.turnInterval = setInterval(() => this.turn(), 500);
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.turnInterval);
        /* const {socket} = this.props;
        socket.off('lobbypos');
        socket.off('playercount');
        socket.off('lobbycount');
        socket.off('enemychoseteam');
        socket.off('start');
        socket.off('battleconnection');
        socket.off("connect");
        socket.disconnect(); */

    }

    turn = () => {
        const {started, enemyteam} = this.state;
        const {socket} = this.props.battleData;
        console.log("turn started");

        if(started && this._isMounted) {
            if (Date.now() - this.afktimer > 60000 && started) {
                socket.disconnect();
                $("#poptext p").text("you have been disconnected for inactivity");
                return;
            }
            if(this.move.moveId){
                if (this.move.moveId === "" || this.doingcharge || this.chargeincoming || this.winner >= 0){
                    console.log(`Charge incoming? ${this.chargeincoming}`);
                    return;
                }
                if (this.move.moveId.includes("switch_")) {
                    console.log("switch");
                    if (this.currentHP[this.currentpoke] > 0)
                        this.switchcd = 40;
                    this.currentpoke = parseInt(this.move.moveId.split("_")[1]);
                    this.forceUpdate(); //take this out and put currentpoke in state
                    this.updateMoveButtons();
                    this.move = this.currentQuickMove();
                    socket.emit('switch', {id: this.currentpoke});
                    this.turnswaited = 0;
                    if ($("#poptext p").html().includes("choose your next pokemon!"))
                        $("#poptext p").text("");
                }
                if (this.currentHP[this.currentpoke] < 1) {
                    //switchcd = 0;
                    $("#poptext p").text("choose your next pokemon!");
                    return;
                }
                if (enemyteam.length && this.currentEnemyHP[this.currentenemypoke] < 1) {
                    $("#poptext p").text("the opponent is choosing their next pokemon!");
                    return;
                }

                //using the move
                /*
                * case 1: quick move
                * case 2: not enough energy
                * case 3: enough energy
                * case 4: we have enough energy with 1 more quick move (undertap)
                **/

                var quickmovedelta = this.convertToEnergy(this.currentQuickMove());
                var movedelta = -1 * this.convertToEnergy(this.move);
                var nextenergy = this.energy[this.currentpoke] + quickmovedelta;
                //                var nextenergy2 = team[currentpoke].energy + quickmovedelta*2;
                var undertap = nextenergy >= movedelta && this.move !== this.currentQuickMove();
                var nextcharge = this.move;

                this.doingcharge = true;
                if (this.move === this.currentQuickMove()) {
                    this.doingcharge = false;
                    this.turnswaited += 1;
                    console.log("case1");
                    if (this.currentQuickMoveDelay() > this.turnswaited)
                        return;
                    this.turnswaited = 0;


                } else if (nextenergy < movedelta) {
                    console.log("case2");
                    this.doingcharge = false;
                    this.move = this.currentQuickMove();
                    this.turnswaited += 1;
                    if (this.currentQuickMoveDelay() > this.turnswaited)
                        return;
                    this.turnswaited = 0;


                } else if (this.energy[this.currentpoke] >= movedelta) {
                    console.log("case3 " + movedelta + " " + this.energy[this.currentpoke]);
                    //no problem
                } else if (undertap) {
                    console.log("case4 undertap");
                    this.doingcharge = false;
                    this.move = this.currentQuickMove()
                    this.turnswaited += 1;
                    if (this.currentQuickMoveDelay() > this.turnswaited)
                        return;
                    this.turnswaited = 0;
                } else {
                    console.log("wtf"); //Lol
                }

                movedelta *= -1;
                //console.log(team[currentpoke].energy);
                //console.log(move);

                socket.emit('dmg', {move: this.move, currentEnemyHP: this.currentEnemyHP});
                if (this.doingcharge && this.oshields > 0) {
                    $("#poptext p").text("waiting for opponent to shield");
                }


                if (!this.doingcharge)
                    this.lock = true;
                setTimeout(() => {
                    console.log(this.move);
                    if(this.move.moveId !== ""){
                        this.lock = false;
                        //                    if (!doingcharge)
                        //                        ;
                        this.animate(2);
                        //console.log(team[currentpoke].atkboosts);

                        this.currentEnemyHP[this.currentenemypoke] -= (this.opponentshielding ? 1 : this.convertToDamage(this.move, true));
                        if ($("#poptext").html().includes("opponent shielded") || $("#poptext").html().includes("waiting for opponent to shield"))
                            $("#poptext p").text("");
                        this.energy[this.currentpoke] += this.convertToEnergy(this.move);
                        this.energy[this.currentpoke] = this.energy[this.currentpoke] > 100 ? 100 : this.energy[this.currentpoke];

                        if (this.move.buffApplyChance && this.move.buffApplyChance === 1) {
                            //console.log(movedata);
                            if (this.move.buffTarget === "opponent") {
                                this.boosts.atk[this.currentpoke] += this.move.buffs[0];
                                this.boosts.def[this.currentpoke] += this.move.buffs[1];
                            } else {
                                this.oboosts.atk[this.currentenemypoke] += this.move.buffs[0];
                                this.oboosts.def[this.currentenemypoke] += this.move.buffs[1];
                            }
                            this.limitboosts();
                        }

                        this.updateHP();
                        this.updateEn();
                        //console.log(move);

                        this.opponentshielding = false;
                        //console.log(undertap);
                        this.move = undertap ? nextcharge : this.currentQuickMove();
                        if (this.doingcharge)
                            this.move = {moveId: ""}; //also clear at the end of turn
                            //this.move = this.currentQuickMove();
                        this.doingcharge = false;

                        if (this.currentEnemyHP[this.currentenemypoke] <= 0)
                            socket.emit("expecting0health", {expectedteam: enemyteam});
                        
                        this.move = {moveId: ""};
                    }
                }, this.doingcharge ? 3500 : 0);

                for (var i = 0; i < 3; i++) { //this bit of logic should probably go in turn function
                    if (this.currentEnemyHP[i] < 1)
                        $(".enemypoke").eq(i).addClass("KOpoke");
                }

                if (this.winner >= 0) { //put this in turn function too
                    if (!this.sentendpacket) {
                        this.sentendpacket = true;
                        socket.emit('end', {});
                        $("#poptext p").text(this.winner === 1 ? "You Win!" : "Good Effort!"); //add rematch or new opponent
                    }
        
                    //socket.disconnect();
                }
            }
        }
    }

    currentQuickMoveDelay = () => {
        console.log("Get current quick move delay");
        return this.props.battleData.team[this.currentpoke].fastMove.cooldown / 500;
    }

    active = () => {
        this.move = this.currentQuickMove();
        this.afktimer = Date.now();
        console.log(this.afktimer);
    }
    
    updateMoveButtons = () => {
        console.log("Updating move buttons")
        var {startrecv, enemyteam} = this.state;
        const {team} = this.props.battleData;

        var q = team[this.currentpoke].fastMove.name;
        var q2 = "unknown";
        if (enemyteam[0] > 0 && startrecv)
            q2 = enemyteam[this.currentenemypoke].fastMove.name;

        var c1 = team[this.currentpoke].chargedMove1.name;
        var c2 = team[this.currentpoke].chargedMove2.name;
        $("#quickmovebtn").text(q);
        $("#enemyquickmovebtn").text(q2);
        $("#chargemove1btn").data("name", c1);
        $("#chargemove1text").text(c1);
        $("#chargemove2btn").data("name", c2);
        $("#chargemove2text").text(c2);

        console.log(team[this.currentpoke].ctype1);
        for (var i = 1; i < 3; i++) {
            $("#chargemove" + i + "btn").attr("class", "movebtn noselect " + team[this.currentpoke]["chargedMove" + i + ""].type);
            $("#move" + i + "background").attr("class", team[this.currentpoke]["chargedMove" + i + ""].type);
        }
        this.updateEn();
    }
    currentQuickMove = () => {
        console.log("Call current quick move");
        return this.props.battleData.team[this.currentpoke].fastMove;
    }
    updateEn = () => {
        //$("#enin").css({width: (team[currentpoke].energy)});
        //console.log(team[currentpoke].energy);
        console.log("update energy");
        var {team} = this.props.battleData;
        $("#move1progress").css({height: (80 * this.energy[this.currentpoke] / team[this.currentpoke].chargedMove1.energy)});
        $("#move2progress").css({height: (80 * this.energy[this.currentpoke] / team[this.currentpoke].chargedMove2.energy)});
        if (this.energy[this.currentpoke] >= team[this.currentpoke].chargedMove1.energy) {
            $("#chargemove1btn").addClass("active")
        } else {
            $("#chargemove1btn").removeClass("active")
        }
        if (this.energy[this.currentpoke] >= team[this.currentpoke].chargedMove1.energy) {
            $("#chargemove2btn").addClass("active")
        } else {
            $("#chargemove2btn").removeClass("active")
        }

    }
    updateSwitchButtons = (position) => {
        if(this.currentpoke === 0){
            return position;
        }
        else if(this.currentpoke === 2){
            return position - 1;
        }
        else{
            return position === 1 ? 0 : 2;
        }
    }

    renderSwitchButtons = () => {
        if(this.props.battleData.team.length > 0){
            var {team} = this.props.battleData;
            if(team.length === 3){
                return(
                    <React.Fragment>
                        <button className='switchbtn' id="1" onClick={() => this.onClickSwitch(1)}>
                            <img alt="" src={
                                `${process.env.PUBLIC_URL}/sprites/${
                                    team[this.updateSwitchButtons(1)].speciesId.replace("_", "-").replace("alolan", "alola")
                                    }.png`
                                } style={{width: '70px'}}/>
                        </button>
                        <button className='switchbtn' id="2" onClick={() => this.onClickSwitch(2)}>
                            <img alt="" src={
                                `${process.env.PUBLIC_URL}/sprites/${
                                    team[this.updateSwitchButtons(2)].speciesId.replace("_", "-").replace("alolan", "alola")
                                    }.png`
                                } style={{width: '70px'}}/>
                        </button>
                    </React.Fragment>
                )
            }
            else if(team.length === 2){
                return(
                    <button className='switchbtn' id="1" onClick={() => this.onClickSwitch(1)}>
                        <img alt="" src={
                            `${process.env.PUBLIC_URL}/sprites/${
                                team[this.updateSwitchButtons(1)].speciesId.replace("_", "-").replace("alolan", "alola")
                                }.png`
                            } style={{width: '70px'}}/>
                    </button>
                )
            }
        }
    }

    animate = (n) => {
        console.log("animate");
        if (n === 1)
            $("#img1").animate({top: "-40px", left: "10px"}, 240, "linear", () => {
                $("#img1").animate({top: "-50px", left: "0px"}, 240, "linear");
            });
        if (n === 2)
            $("#img2").animate({top: "40px", left: "410px"}, 240, "linear", () => {
                $("#img2").animate({top: "50px", left: "420px"}, 240, "linear");
            });
    }

    setInitialHP = () => {
        const {team} = this.props.battleData;
        const {enemyteam} = this.state;
        this.currentHP = team.map((mon) => {
            return mon.stats.maxhp;
        });
        this.currentEnemyHP = enemyteam.map((mon) => {
            return mon.stats.maxhp;
        });
        console.log(`Initial HP values: ${this.currentHP}, ${this.currentEnemyHP}`);
    }

    updateHP = () => {
        const{enemyteam} = this.state;
        const {team} = this.props.battleData;
        //                if (winner >= 0) {
        //                    display(winner === 1 ? "you win" : "you lose");
        //                    return;
        //                }
        console.log("updating HP");
        if (this.currentHP[0] < 1 && this.currentHP[1] < 1 && this.currentHP[2] < 1)
            this.winner = 0;
        if (this.currentEnemyHP[0] < 1 && this.currentEnemyHP[1] < 1 && this.currentEnemyHP[2] < 1)
            this.winner = 1;

        console.log(`Current HP: ${this.currentHP}, Current Enemy HP: ${this.currentEnemyHP}`);
        var w1 = Math.floor((this.currentHP[this.currentpoke] / team[this.currentpoke].stats.maxhp) * 200);
        var w2 = Math.floor((this.currentEnemyHP[this.currentenemypoke] / enemyteam[this.currentenemypoke].stats.maxhp) * 200);
        console.log(`New User HP: ${w1}, New Enemy HP: ${w2}`);
        $("#hp2").css({width: (w1)}); //div shortens based on amount of health
        $("#hp1").css({width: (w2)});
        $("#hp1").css({"background-color": (w2 < 100 ? (w2 < 20 ? ("red") : "yellow") : "#66ff66")});
        $("#hp2").css({"background-color": (w1 < 100 ? (w1 < 20 ? ("red") : "yellow") : "#66ff66")});
        //sets color based on width of div
    }

    limitboosts = () => {
        this.boosts.atk[this.currentpoke] = this.limit(this.boosts.atk[this.currentpoke]);
        this.boosts.def[this.currentpoke] = this.limit(this.boosts.def[this.currentpoke]);
        this.oboosts.atk[this.currentenemypoke] = this.limit(this.oboosts.atk[this.currentenemypoke]);
        this.oboosts.def[this.currentenemypoke] = this.limit(this.oboosts.def[this.currentenemypoke]);
    }
    limit = (stat) => {
        if (stat > 4)
            stat = 4;
        if (stat < -4)
            stat = -4;
        return stat;
    }

    convertToDamage = (move, attacking) => {
        const {team} = this.props.battleData;
        const {enemyteam} = this.state;
        var user = attacking ? team[this.currentpoke] : enemyteam[this.currentenemypoke];
        var receiver = !attacking ? team[this.currentpoke] : enemyteam[this.currentenemypoke];
        console.log(`User: ${user.speciesName}, Move: ${move.moveId}`);
        console.log("converting to damage");
        var bonusMultiplier = 1.3;
        var power = move.power;
        var effectiveness = this.getEffectiveness(move.type, receiver.types);
        let stab = this.moveGetsSTAB(move, user.types);
        var atk = user.stats.atk;
        var def = receiver.stats.def;
    
        var atkboosts = this.boostMultiplier(attacking ? this.boosts.atk[this.currentpoke] : this.oboosts.atk[this.currentenemypoke]);
        var defboosts = this.boostMultiplier(!attacking ? this.boosts.def[this.currentpoke] : this.oboosts.def[this.currentenemypoke]);
        var totalboosts = atkboosts / defboosts;
        console.log(`Boosts: ${totalboosts}`);
    
        var damage = Math.floor(totalboosts * power * stab * (atk / def) * effectiveness * 0.5 * bonusMultiplier) + 1;
        console.log(`Damage: ${damage}`);
        if (damage > 5) {
            console.log(damage);
            console.log(atkboosts);
        }
        return damage;
    }

    getEffectiveness = (moveType, targetTypes) => {
        var effectiveness = 1;
    
        moveType = moveType.toLowerCase();
    
        for (var i = 0; i < targetTypes.length; i++) {
            var type = targetTypes[i].toLowerCase();
            var traits = this.getTypeTraits(type);
    
            if (traits.weaknesses.indexOf(moveType) > -1) {
                effectiveness *= 1.6;
            } else if (traits.resistances.indexOf(moveType) > -1) {
                effectiveness *= .625;
            } else if (traits.immunities.indexOf(moveType) > -1) {
                effectiveness *= .390625;
            }
        }
        console.log(`Effectiveness: ${effectiveness}`);
        return effectiveness;
    }

    getTypeTraits = (type) => { //redo this so that it is a json object, saves time and space
        var traits = {
            weaknesses: [],
            resistances: [],
            immunities: []
        };
    
        switch (type) {
            case "normal":
                traits = {resistances: [],
                    weaknesses: ["fighting"],
                    immunities: ["ghost"]};
                break;
    
            case "fighting":
                traits = {resistances: ["rock", "bug", "dark"],
                    weaknesses: ["flying", "psychic", "fairy"],
                    immunities: []};
                break;
    
            case "flying":
                traits = {resistances: ["fighting", "bug", "grass"],
                    weaknesses: ["rock", "electric", "ice"],
                    immunities: ["ground"]};
                break;
    
            case "poison":
                traits = {resistances: ["fighting", "poison", "bug", "fairy", "grass"],
                    weaknesses: ["ground", "psychic"],
                    immunities: []};
                break;
    
            case "ground":
                traits = {resistances: ["poison", "rock"],
                    weaknesses: ["water", "grass", "ice"],
                    immunities: ["electric"]};
                break;
    
            case "rock":
                traits = {resistances: ["normal", "flying", "poison", "fire"],
                    weaknesses: ["fighting", "ground", "steel", "water", "grass"],
                    immunities: []};
                break;
    
            case "bug":
                traits = {resistances: ["fighting", "ground", "grass"],
                    weaknesses: ["flying", "rock", "fire"],
                    immunities: []};
                break;
    
            case "ghost":
                traits = {resistances: ["poison", "bug"],
                    weaknesses: ["ghost", "dark"],
                    immunities: ["normal", "fighting"]};
                break;
    
            case "steel":
                traits = {resistances: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
                    weaknesses: ["fighting", "ground", "fire"],
                    immunities: ["poison"]};
                break;
    
            case "fire":
                traits = {resistances: ["bug", "steel", "fire", "grass", "ice", "fairy"],
                    weaknesses: ["ground", "rock", "water"],
                    immunities: []};
                break;
    
            case "water":
                traits = {resistances: ["steel", "fire", "water", "ice"],
                    weaknesses: ["grass", "electric"],
                    immunities: []};
                break;
    
            case "grass":
                traits = {resistances: ["ground", "water", "grass", "electric"],
                    weaknesses: ["flying", "poison", "bug", "fire", "ice"],
                    immunities: []};
                break;
    
            case "electric":
                traits = {resistances: ["flying", "steel", "electric"],
                    weaknesses: ["ground"],
                    immunities: []};
                break;
    
            case "psychic":
                traits = {resistances: ["fighting", "psychic"],
                    weaknesses: ["bug", "ghost", "dark"],
                    immunities: []};
                break;
    
            case "ice":
                traits = {resistances: ["ice"],
                    weaknesses: ["fighting", "fire", "steel", "rock"],
                    immunities: []};
                break;
    
            case "dragon":
                traits = {resistances: ["fire", "water", "grass", "electric"],
                    weaknesses: ["dragon", "ice", "fairy"],
                    immunities: []};
                break;
    
            case "dark":
                traits = {resistances: ["ghost", "dark"],
                    weaknesses: ["fighting", "fairy", "bug"],
                    immunities: ["psychic"]};
                break;
    
            case "fairy":
                traits = {resistances: ["fighting", "bug", "dark"],
                    weaknesses: ["poison", "steel"],
                    immunities: ["dragon"]};
                break;
            default:
                traits = {weaknesses: [],
                    resistances: [],
                    immunities: []};
                break;
        }
    
        console.log("Traits");
        console.log(traits);
        return traits;
    }

    moveGetsSTAB = (move, user) => {
        let stab = 1;
        for (var t in user.types) {
            if (user.types[t] === move.type && stab === 1)
                stab = 1.2;
        }
        console.log(`STAB: ${stab}`);
        return stab;
    }

    boostMultiplier = (boosts) => {
        var temp = 1 + 0.25 * Math.abs(boosts);
        return boosts >= 0 ? temp : 1 / temp;
    }

    convertToEnergy = (move) => {
        return move.energyGain - move.energy;
    }

    onClickChargedMove1 = () => {
        if (!this.state.started || this.lock)
            return;
        this.move = this.props.battleData.team[this.currentpoke].chargedMove1;
    }

    onClickChargedMove2 = () => {
        if (!this.state.started || this.lock)
            return;
        if(this.props.battleData.team[this.currentpoke].chargedMove2)
            this.move = this.props.battleData.team[this.currentpoke].chargedMove2;
    }

    renderShieldButton = () => {
        if(this.chargeincoming && this.shields > 0){
            if(this.shields === 2){
                return "<button>Use Shield \n x2</button>";
            }
            else{
                return "<button>Use Shield \n x1</button>";
            }
        }
    }

    useShield = () => { //add logic here to set the incoming damage to 1?
        if(this.chargeincoming){
            console.log("Shield button clicked.");
            const {socket} = this.props.battleData;
            this.shielding = true;
            socket.emit('shield', {});
            this.shields--;
            console.log(`Shields left: ${this.shields}`);
            $("#shieldbutton").html("");
        }
    }

    onClickSwitch = (at) => {
        console.log('switch clicked');
        //console.log(currentpoke);
        console.log(at);
        if (!this.doingcharge && this.currentpoke !== at) //confirm switch is possible
            this.move = {
                moveId: `switch_${at}`
            }
    }


    render() {
        var {started, startrecv, enemyteam, enemyname} = this.state;
        const {team, league, currentUser, socket} = this.props.battleData;

        if(this.battleConnected){
            this.battleConnected = false;
            socket.emit('battleconnection', {id: socket.id, privacyPacket: {status: false}});
        }
        socket.on('connected', () => {
            $("#poptext p").text("Waiting for opponent!");
            if (league === "Great" && !startrecv){
                console.log('Sending great league request...');
                socket.emit('lobbyrequest', {num: 199, privacyPacket: this.props.privacyPacket}); //pass invite in here, make invite an object that both players need to have!
                console.log(socket.id);
                socket.emit('ready', {id: socket.id});
            }
            else if(league === "Master" && !startrecv){
                socket.emit('lobbyrequest', {num: 5099, privacyPacket: this.props.privacyPacket});
                console.log(socket);
                socket.emit('ready', {id: socket.id});
            }
        });

        socket.on('start', (data) => {
            $("#poptext p").text("");
            console.log("received start");
            socket.emit('enemychoseteam', {enemyteam: team, enemyname: currentUser.username});
            if (startrecv) //startrecv = start received. Used to check if the opponent disconnected, and to prevent initialization methods from running again.
                return;
            
            this.afktimer = Date.now();
            this.setState({startrecv: true});    

            setTimeout(() => {
                $("#poptext p").text("");
            }, 0);
            setTimeout(() => {
                $("#poptext p").text("3");
                this.updateMoveButtons();
                this.updateSwitchButtons();
            }, 500);
            setTimeout(() => {
                $("#poptext p").text("2");
            }, 1500);
            setTimeout(() => {
                $("#poptext p").text("1");
                //failsafe
            }, 2500);
            setTimeout(() => {
                $("#poptext p").text("GO!");
            }, 3500);
            setTimeout(() => {
                $("#poptext p").text("");
                //this.move = this.currentQuickMove(); //Im thinking that this is screwing up the turn function by using a move when it hasnt been used
                this.setState({started: true});
            }, 4500);
        });

        socket.on('lobbypos', (data) => {
            console.log('lobbypos called');
            $("#lobbynumber").text(data.lobbypos + 1);
        });
        socket.on('playercount', (data) => {
            $("#playercount").text(data.count);
            if (data.count === 1 && startrecv) {
                $("#poptext p").text("The enemy disconnected");
                socket.disconnect();
                this.setState({started: false});
            }
        });
        socket.on('lobbycount', (data) => {
            $("#lobbies1").text(data.lobbies1 === "" ? "none" : data.lobbies1);
            $("#lobbies2").text(data.lobbies2 === "" ? "none" : data.lobbies2);
        });
        socket.on('enemychoseteam', (data) => { //socket for setting enemy team
            console.log(data);
            this.setState({enemyteam: data.enemyteam, enemyname: data.enemyname});
            $("#playercountinlobby").text(2);
            this.setInitialHP();
            $("#enemycp").text(data.enemyteam[this.currentenemypoke].cp + " CP");
        });

        socket.on('dmg', (data) => { //need to pass the entire move into data
                if (!started)
                    return;
                console.log("Got: " + data.move.moveId);
                console.log(data);
                var dmg = this.convertToDamage(data.move, false);
                console.log(`On Damage, dmg: ${dmg}`);
                var energyused = data.move.energyGain - data.move.energy;
                //console.log(data.health[currentpoke] - dmg);
                console.log(`On damage, current poke health: ${data.currentEnemyHP[this.currentpoke]}`);
                var enemyExpectsUsToDie = data.currentEnemyHP[this.currentpoke] - dmg <= 0;
                if (enemyExpectsUsToDie) {
                    console.log("enemy expects us to die");
                }
                this.chargeincoming = false;
                if (energyused < 0) {
                    this.chargeincoming = true;
                    $("#shieldbutton").fadeIn(0);
                    setTimeout(() => {
                        $("#shieldbutton").fadeOut(0);
                    }, 2700);
                    $("#poptext p").text("charge move incoming!");
                    $('#shieldbutton').html(this.renderShieldButton);
                }
                setTimeout(() => {
                    if (!this.chargeincoming)
                        this.animate(1);
                    this.currentHP[this.currentpoke] -= this.shielding ? 1 : dmg;

                    this.updateHP();
                    //acid spray
                    console.log(this.move);
                    if (data.move.buffApplyChance && data.move.buffApplyChance === 1) {
                        //console.log(movedata);
                        if (data.move.buffTarget === "opponent") {
                            this.boosts.atk[this.currentpoke] += data.move.buffs[0];
                            this.boosts.def[this.currentpoke] += data.move.buffs[1];
                        } else {
                            this.oboosts.atk[this.currentenemypoke] += data.move.buffs[0];
                            this.oboosts.def[this.currentenemypoke] += data.move.buffs[1];
                        }
                        this.limitboosts();
                    }

                    if (this.chargeincoming) {
                        //display("the charge move was " + data.move.toLowerCase().replace("_", " "));
                        $("#poptext p").text("the charge move was " + data.move.moveId.toLowerCase().replace("_", " ").replace("_", " "));
                        setTimeout(() => {
                            if ($("#poptext").html().includes("the charge move was "))
                                $("#poptext p").text("");
                        }, 1500);
                    }

                    setTimeout(() => {
                        if ($("#poptext").html().includes("the charge move was "))
                            $("#poptext p").text("");
                    }, 1500);
                    this.shielding = false;
                    this.chargeincoming = false;
                }, this.chargeincoming ? 3500 : 0);
            }
        );

        socket.on('shield', (data) => {
            /* if (this.oshields === 0)
                return; */
            if(this.doingcharge){
                this.opponentshielding = true;
                $("#poptext p").text("opponent shielded");
                this.oshields--;
                console.log(`Opponent shields: ${this.oshields}`);
                this.doingcharge = false;
            }
        });

        socket.on('switch', (data) => {
            //console.log("switch");
            //console.log(data);
            this.currentenemypoke = data.id;
            this.updateMoveButtons();
            if ($("#poptext").html().includes("the opponent is choosing their next pokemon!"))
                $("#poptext p").text("");
            $("img1").html('<img alt="" src={' + process.env.PUBLIC_URL + '/sprites/' + 
                this.state.enemyteam[this.currentenemypoke].speciesId.replace("_", "-").replace("alolan", "alola")+ 
                '.png} style={{width:"80px"}}/>');
            $("#enemycp").text(this.state.enemyteam[this.currentenemypoke].cp + " CP");
        });


        if(startrecv && enemyteam[0]) {
            return (
                <React.Fragment>
                    <div className="bgcontainer" 
                    style={{height:'480px', paddingTop: '25px', position: 'relative'}}
                    onClick={this.active}>
                        <div id='enemyteam' className="battlestuff">
                            <div className='enemypoke'></div>
                            <div className='enemypoke'></div>
                            <div className='enemypoke'></div>
                        </div>
                        <div id='enemycp'></div>
                        <div id='name1'>{enemyname}</div>
                        <div className="hpcontainer battlestuff" style={{width: '203px'}} id="hp1container"><div className="hp" style={{width: '200px'}} id="hp1"></div></div>
                        <div className="pokeimage battlestuff" id='img1'>
                            <img alt="" src={`${process.env.PUBLIC_URL}/sprites/${
                            enemyteam[this.currentenemypoke].speciesId.replace("_", "-").replace("alolan", "alola")
                            }.png`} style={{width:'80px'}}/>
                        </div>
                        <img className="battlestuff" src={`${process.env.PUBLIC_URL}/shield.png`}
                         style={{width: '50px'}} id="shield1" alt="shield" onClick={this.onClickShield}/>
                        <span id="shieldcount1" className="battlestuff">{this.shields}</span>    
                        <img className="battlestuff" src={`${process.env.PUBLIC_URL}/shield.png`} 
                        style={{width: '50px'}} id="shield2" alt="shield" onClick={this.onClickShield}/>
                        <span id="shieldcount2" className="battlestuff">{this.oshields}</span>
                        <div className="hpcontainer battlestuff" style={{width:'203px'}} id="hp2container"><div className="hp" style={{width: '200px'}} id="hp2"></div></div>
                        <div className="pokeimage battlestuff" id='img2'>
                            <img alt="" src={`${process.env.PUBLIC_URL}/sprites/${
                            team[this.currentpoke].speciesId.replace("_", "-").replace("alolan", "alola")
                            }.png`} style={{width:'80px'}}/>
                        </div>
                        <div id='name2' className="battlestuff">{currentUser.username}</div>
                    </div>
                    <div id="poptext" style={{textTransform: 'none'}}>
                        <p></p>
                        <div id="shieldbutton" onClick={this.useShield}></div>
                    </div>
                    <div id="buttons"  className="bgcontainer battlecontainer" style={{display: 'block'}}>
                        <div id="quickmovecontainer"><b>Fast Move</b> <span id="quickmovebtn">{team[this.currentpoke].fastMove.name}</span></div>
                        <div id="enemyquickmovecontainer"><b>enemy quick move:</b> <span id="enemyquickmovebtn">unknown</span></div>
                        <div id="chargemove1container" onClick={this.onClickChargedMove1}>
                            <div id="chargemove1btn" className="movebtn noselect rock active"></div>
                            <div id="move1progress" style={{height: '60px'}}>                
                                <div id="move1background" className="rock"></div>
                            </div>
                            <div id="chargemove1text" className="">{team[this.currentpoke].chargedMove1.name}</div>
                        </div>
    
                        <div id="chargemove2container" onClick={this.onClickChargedMove2}>
                            <div id="chargemove2btn" className="movebtn noselect ground"></div>
                            <div id="move2progress" style={{height: '60px'}}>
                                <div id="move2background" className="ground"></div>
                            </div>
                            <div id="chargemove2text" className="">{team[this.currentpoke].chargedMove2 ? team[this.currentpoke].chargedMove2.name : ""}</div>
                        </div>
                    </div>
                    <div id='switch' className="bgcontainer battlecontainer" style={{display: 'block'}}><b>switch: </b>
                        {this.renderSwitchButtons()}
                        <b>cooldown:</b> <span id='cd'>{this.switchcd}</span>
                    </div>
                    <div id='lobby' className="bgcontainer" style={{textTransform: 'none'}}>
                        <div id="playercountcontainer">
                            <b>Players online:</b> <span id="playercount">1</span>
                        </div>
                        <div id="lobbynumbercontainer">
                            <b>Lobby number:</b> <span id="lobbynumber">0</span>/9999
                        </div>
                        <div id="playercountinlobbycontainer">
                                <b>Players in your lobby:</b> <span id="playercountinlobby">1</span>/2
                            </div>
                        <div>
                            <b>Lobbies with 1 player:</b> <span id='lobbies1'>none</span><br/>
                            <b>Full lobbies:</b> <span id='lobbies2'>none</span>
                        </div>
                        <div id="changelobbycontainer">
                            <input type="text" id="lobbyinput"/><button id="changelobbybtn">change lobby</button>
                        </div>
                        <span id='tutorial' style={{textTransform: 'none'}}>To 1v1 a friend, select a lobby (above 100) and send them the number</span>
                    </div>
                </React.Fragment>
            )
        }else {
            return(
                <React.Fragment>
                    <div id="poptext" style={{textTransform: 'none'}}></div><br/>
                    <div id='lobby' className="bgcontainer" style={{textTransform: 'none'}}>
                            <div id="playercountcontainer">
                                <b>Players online:</b> <span id="playercount">1</span>
                            </div>
                            <div id="lobbynumbercontainer">
                                <b>Lobby number:</b> <span id="lobbynumber">0</span>/999
                            </div>
                            <div id="playercountinlobbycontainer">
                                    <b>Players in your lobby:</b> <span id="playercountinlobby">1</span>/2
                                </div>
                            <div>
                                <b>Lobbies with 1 player:</b> <span id='lobbies1'>none</span><br/>
                                <b>Full lobbies:</b> <span id='lobbies2'>none</span>
                            </div>
                        </div>
                    </React.Fragment>
            )
        }
    }
}

export default Battle;