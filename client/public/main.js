$(function () {

    socket = window.location.href.includes("heroku") ?
        io.connect(window.location.href.replace("http", "ws")) :
        io.connect('http://localhost:4000/')

    console.log(socket);
    //socket.emit('migrateuser', {});
    socket.emit('battleconnection', {id: socket.id, privacyPacket: {status: false}, user: battleData.currentUser._id});
    
    

    /* function initteam(teamdata) { //parse team json and set team variables
        var team2 = [];
        team2.push(JSON.parse(JSON.stringify(teamdata))[0]);
        team2.push(JSON.parse(JSON.stringify(teamdata))[1]);
        team2.push(JSON.parse(JSON.stringify(teamdata))[2]);
        //console.log(team2[0]);
        for (var i = 0; i < 3; i++) {
            if (!team2[i].cinematicMove2)
                team2[i].cinematicMove2 = team2[i].cinematicMove;
            team2[i].name = team2[i].pokemon.replace("_FORM", "").replace("ALOLA", "ALOLAN");
            var p = gm.getPokemonById(team2[i].name.toLowerCase());
            var cpm = cpms[(team2[i].level - 1) * 2];
            var cmove1 = gm.getMoveById(team2[i].cinematicMove);
            var cmove2 = gm.getMoveById(team2[i].cinematicMove2);
            //if(cmove2===undefined)cmove2=JSON.parse(JSON.stringify(cmove1));//for things with 1 charge move

            team2[i].hp = Math.floor((p.baseStats.hp + team2[i].individualStamina) * cpm);
            team2[i].maxhp = team2[i].hp;
            team2[i].atk = (p.baseStats.atk + team2[i].individualAttack) * cpm;
            team2[i].def = (p.baseStats.def + team2[i].individualDefense) * cpm;
            team2[i].energy = 0;
            team2[i].req1 = cmove1.energy;
            team2[i].req2 = cmove2.energy;
            team2[i].ctype1 = cmove1.type;
            team2[i].ctype2 = cmove2.type;
            team2[i].quickMoveDelay = (gm.getMoveById(team2[i].quickMove.replace("_FAST", "")).cooldown) / 500;
            team2[i].atkboosts = 0;
            team2[i].defboosts = 0;
            team2[i].cmove1 = cmove1;
            team2[i].cmove2 = cmove2;
            team2[i].cp = calcCP(p.speciesId, team2[i].level, team2[i].individualAttack, team2[i].individualDefense, team2[i].individualStamina);
        }
        return team2; 
    } */

    /* setTimeout(function () { //HERE is where the json from api call will be served!
        //get user and call team data from api then store
        team = initteam(defaultbox.pokemon);
        enemyteam = initteam(defaultbox.pokemon);
        team = battleData.team;
        //enemyteam = battleData.team;
    }, 1); */

    socket.on('connected', () => {

        $("#poptext p").text("Waiting for opponent!");
        if (battleData.league === "Great" && !startrecv){
            console.log('Sending great league request...');
            var privacyPacket = window.localStorage.getItem('PrivacyPacket') ? JSON.parse(window.localStorage.getItem('PrivacyPacket')) : {status: false};
            console.log(privacyPacket);
            socket.emit('lobbyrequest', {num: 199, privacyPacket: privacyPacket}); //pass invite in here, make invite an object that both players need to have!
            console.log(socket.id);
            socket.emit('ready', {id: socket.id});
        }
        else if(battleData.league === "Master" && !startrecv){
            socket.emit('lobbyrequest', {num: 5099, privacyPacket: privacyPacket});
            console.log(socket);
            socket.emit('ready', {id: socket.id});
        }
    });

    socket.on('lobbypos', function (data) { //socket for lobby position
        $("#lobbynumber").text(data.lobbypos + 1);
    });
    socket.on('lobbycount', function (data) {
        $("#lobbies1").text(data.lobbies1 === "" ? "none" : data.lobbies1);
        $("#lobbies2").text(data.lobbies2 === "" ? "none" : data.lobbies2);
        if (data.count === 1 && startrecv) {
            //display("Opponent Disconnected. \n" + refreshbtn);
            display("Opponent Disconnected. \n You may now close this page.");
            //when leaderboards are a thing, send through socket here
            socket.disconnect();
            //code here to send status back to react, for both players?
            window.localStorage.setItem("winner", playername);
            started = false;
        }
        $("#playercountinlobby").text(data.count);
    });


    socket.on('dmg',  //socket for dmg dealt
            function (data) {
                console.log('damage');
                if (!started)
                    return;
                //console.log("Got: " + data.move);
                //console.log(data);
                var dmg = convertToDamage(data.move, false);
                var energyused = convertToEnergy(data.move);
                //console.log(data.health[currentpoke] - dmg);
                var enemyExpectsUsToDie = data.health[currentpoke] - dmg <= 0;
                if (enemyExpectsUsToDie) {
                    console.log("enemy expects us to die");
                }
                chargeincoming = false;
                if (energyused < 0) {
                    chargeincoming = true;
                    var btn = "<button class='shieldbtn'>shield</button>";
                    setTimeout(function () {
                        $(".shieldbtn").fadeOut(0);
                    }, 2700);
                    display2("charge move incoming!" + (shields > 0 ? btn : ""));
                }
                setTimeout(function () {
                    if (!chargeincoming)
                        animate(1);
                    currentHP[currentpoke] -= shielding ? 1 : dmg;


                    updateHP();
                    //var movedata = gm.getMoveById(data.move);

                    //acid spray 
                    //console.log(movedata);
                    if (move.buffApplyChance && move.buffApplyChance === 1) {
                        //console.log(movedata);
                        if (move.buffTarget === "opponent") {
                            boosts.atk[currentpoke] += move.buffs[0];
                            boosts.def[currentpoke] += move.buffs[1];
                        } else {
                            oboosts.atk[currentenemypoke] += move.buffs[0];
                            oboosts.def[currentenemypoke] += move.buffs[1];
                        }
                        limitboosts();
                    }

                    if (chargeincoming) {
                        //display("the charge move was " + data.move.toLowerCase().replace("_", " "));
                        display2("the charge move was " + data.move.name);
                        setTimeout(function () {
                            if ($("#win2").html().includes("the charge move was "))
                                display2("");
                        }, 1500);
                    }

                    setTimeout(function () {
                        if ($("#win").html().includes("the charge move was "))
                            display("")
                    }, 1500);
                    shielding = false;
                    chargeincoming = false;
                }, chargeincoming ? 3500 : 0);


            }
    );

    socket.on('shield', function (data) { //socket for shield
        if (oshields === 0)
            return;
        opponentshielding = true;
        display("opponent shielded");
        oshields--;
    });
    socket.on('switch', function (data) { //socket for switching
        //console.log("switch");
        //console.log(data);
        currentenemypoke = data.id;
        updateMoveButtons();
        if ($("#win").html().includes("the opponent is choosing their next pokemon!"))
            display("");
        /* $("img1").html('<img alt="" src={' + process.env.PUBLIC_URL + '/sprites/' + 
            this.state.enemyteam[this.currentenemypoke].speciesId.replace("_", "-").replace("alolan", "alola")+ 
            '.png} style={{width:"80px"}}/>');
        $("#enemycp").text(this.state.enemyteam[this.currentenemypoke].cp + " CP"); */
    });
    socket.on('playercount', function (data) { //socket for player count
        $("#playercount").text(data.count);
    });
    socket.on('enemychoseteam', function (data2) { //socket for enemy team
        console.log(data2);
        enemyteam = data2.enemyteam;
        enemyname = data2.enemyname;
        $("#playercountinlobby").text(2);
        setInitialHP();
        $("#enemycp").text(data2.enemyteam[currentenemypoke].cp + " CP");
    });
    /* //This function will never happen with the new layout
    socket.on('enemychangedname', function (data2) {
        enemyname = data2.playername;
    }); */

    //switch or use a move

    setInterval(function () {
        console.log('interval');
        if (Date.now() - afktimer > 60000 && started && winner === 0) {
            socket.disconnect();
            display("you have been disconnected for inactivity");
            return;
        }
        if (move.moveId === "" || doingcharge || chargeincoming || winner >= 0){
            console.log(move);
            console.log(doingcharge);
            console.log(chargeincoming);
            console.log(winner);
            return;
        }
        if (move.moveId.includes("switch_")) {
            console.log("switch")
            if (currentHP[currentpoke] > 0)
                switchcd = 40;
            currentpoke = parseInt(move.moveId.split("_")[1]);
            updateMoveButtons();
            //move = currentQuickMove();
            //move = {moveId: ""};
            socket.emit('switch', {id: currentpoke});
            turnswaited = 0;
            if ($("#win").html().includes("choose your next pokemon!"))
                display("");
        }
        if (currentHP[currentpoke] < 1) {
            //switchcd = 0;
            console.log("choose your next pokemon!");
            display("choose your next pokemon!");
            return;
        }
        if (currentEnemyHP[currentenemypoke] < 1) {
            display("the opponent is choosing their next pokemon!");
            return;
        }

        //using the move
        /*
         * case 1: quick move
         * case 2: not enough energy
         * case 3: enough energy
         * case 4: we have enough energy with 1 more quick move (undertap)
         **/

        var quickmovedelta = convertToEnergy(currentQuickMove());
        var movedelta = -1 * convertToEnergy(move);
        var nextenergy = energy[currentpoke] + quickmovedelta;
        //                var nextenergy2 = team[currentpoke].energy + quickmovedelta*2;
        var undertap = nextenergy >= movedelta && move !== currentQuickMove();
        var nextcharge = move;

        doingcharge = true;
        if (move === currentQuickMove()) {
            doingcharge = false;
            //console.log("case1");
            turnswaited++;
            console.log('fast move');
            if (currentQuickMoveDelay() > turnswaited)
                return;
            turnswaited = 0;
        } else if (nextenergy < movedelta) {
            doingcharge = false;
            //console.log("case2");
            move = currentQuickMove();
            turnswaited++;
            console.log('not enough energy for charge move');
            if (currentQuickMoveDelay() > turnswaited)
                return;
            turnswaited = 0;
        } else if (energy[currentpoke] >= movedelta && !move.moveId.includes("switch_")) {
            //console.log("case3 " + movedelta + " " + team[currentpoke].energy);
            //no problem
            console.log('doing charge move');
        } else if (undertap) {
            doingcharge = false;
            //console.log("case4 undertap");
            move = currentQuickMove();
            turnswaited++;
            console.log('undertap');
            if (currentQuickMoveDelay() > turnswaited)
                return;
            turnswaited = 0;
        }else if(move.moveId.includes("switch_")){
            doingcharge = false;
        } 
        else {
            console.log("wtf");
        }

        movedelta *= -1;
        //console.log(team[currentpoke].energy);
        //console.log(move);

        console.log(move);
        socket.emit('dmg', {move, health: currentEnemyHP}); //take this out, switch to onclick
        if (doingcharge && oshields > 0) {
            display("waiting for opponent to shield");
        }


        if (!doingcharge)
            lock = true;
        setTimeout(function () {
            if(move.moveId !== "" && !move.moveId.includes("switch_")){
                lock = false;
                //                    if (!doingcharge)
                //                        ;
                animate(2);
                //console.log(team[currentpoke].atkboosts);
                currentEnemyHP[currentenemypoke] -= (opponentshielding ? 1 : convertToDamage(move, true));
                if ($("#win").html().includes("opponent shielded") || $("#win").html().includes("waiting for opponent to shield"))
                    display("");
                energy[currentpoke] += convertToEnergy(move);
                energy[currentpoke] = energy[currentpoke] > 100 ? 100 : energy[currentpoke];
    
                //var movedata = gm.getMoveById(move);
    
                if (move.buffApplyChance && move.buffApplyChance === 1) {
                    //console.log(movedata);
                    if (move.buffTarget === "self") {
                        boosts.atk[currentpoke] += move.buffs[0];
                        boosts.def[currentpoke] += move.buffs[1];
                    } else {
                        oboosts.atk[currentenemypoke] += move.buffs[0];
                        oboosts.def[currentenemypoke] += move.buffs[1];
                    }
                    limitboosts();
                }
    
                updateHP();
                updateEn();
                //console.log(move);
    
                opponentshielding = false;
                //console.log(undertap);
                move = undertap ? nextcharge : currentQuickMove();
                if (doingcharge)
                    move = {moveId: ""};
                doingcharge = false;
    
                if (currentEnemyHP[currentenemypoke] <= 0)
                    socket.emit("expecting0health", {expectedteam: enemyteam, expectedenergy: oenergy});
            
                move = {moveId: ""}
            }
        }, doingcharge ? 3500 : 0);

    }, 500);
    socket.on('expecting0health', function (data) {
        if (currentHP[currentpoke] > 0) {
            /* var e0 = team[0].energy;
            var e1 = team[1].energy;
            var e2 = team[2].energy; */
            team = data.expectedteam;
            /* team[0].energy = e0;
            team[1].energy = e1;
            team[2].energy = e2; */
            energy = data.expectedenergy;
        }
    });


    socket.on('start', function (data) { //socket for starting the game

        console.log("received start");
        if (startrecv) //What is this actually doing?
            return;
//this is new
        $(".battlestuff").css({opacity: 100});
        $(".battlecontainer").css({display: "block"});

        $("#ready").fadeOut(0);
        $("#ready2").fadeOut(0);
//this is new
        afktimer = Date.now();
        startrecv = true;
        setTimeout(function () {
            console.log('3');
            display("3");
            socket.emit('enemychoseteam', {enemyteam: team, enemyname: playername});
            //socket.emit('enemychangedname', {playername});
        }, 0);
        setTimeout(function () {
            console.log('2');
            display("2")
        }, 1000);
        setTimeout(function () {
            console.log('1');
            display("1");
            //failsafe
            updateMoveButtons();
            updateSwitchButtons();
        }, 2000);
        setTimeout(function () {
            console.log('starting...');
            display("");
            //move = currentQuickMove();
            started = true;
        }, 3000);
    });






    $("body").on("click", ".maincontainer", function () {
        console.log('clicked');
        move = currentQuickMove();
        afktimer = Date.now();
    });





    //------------------------------------------------------------------------------------------------------------
    //INTERFACE STUFF

    //failsafe for some wierd mobile bug
    setTimeout(function () {
        $("#team div").eq(0).click();
        $("#team div").eq(0).click();
    }, 200);



    /* $('#ready').click(function () {
        //Instead of checking this, set the team before joining game mode and check league property of team data
        if (teamFitsInGreat)
            joinGameMode(4199);
    });
    $('#ready2').click(function () {
        joinGameMode(8099);
    });
    function joinGameMode(lobby) {
        if (!changedlobby) {
            socket.emit('lobbyrequest', {num: lobby});
            display("waiting for opponent");
            $("#ready").show(0);
            $("#ready2").show(0);
//this is new
            if (lobby === 4199)
                $("#ready").fadeOut(0);
            if (lobby === 8099)
                $("#ready2").fadeOut(0);
            $("#lobbynumbercontainer").fadeOut(0);
            $("#changelobbycontainer").fadeOut(0);
            $("#tutorial").fadeOut(0);
        }//this is new
        socket.emit('ready', {id: socket.id});
    } */

    /* $("#team").on("click", "div", function () { //move this to teambuilder
        if (startrecv)
            return;
        if ($(this).attr("id") === "newpoke") { //if adding new pokemon in the current teambuilder
            //open pvpoke's window for adding pokemon
            new modalWindow("add new pokemon", $(".addpoke"));
        } else {
            selectedNewTeam(this);
        }

    }); */

    /* function calcBoxCP(poke) {
        //Delete replaces when updated db with pvpoke gamemaster json
        var name = poke.pokemon.replace("_FORM", "").toLowerCase().replace("-", "_").replace("ALOLA", "ALOLAN");
        return calcCP(name, poke.level, poke.individualAttack, poke.individualDefense, poke.individualStamina);
    } */
    /* if (localStorage.id && localStorage.id !== "") {
        $("#pokebattlerid").val(localStorage.id);
        setTimeout(function () {
            $("#loadteam").click();
        }, 0);
    } */
    /* $("#loadteam").click(function () {  //Load team using a pokebattler id
        if (started) //This should never happen once the battle screen is on its own page
            return;
        var id = Number.parseInt($("#pokebattlerid").val());
        //Check id field for a number, else load default team. Won't be necessary when battle screen and teambuilder are on separate pages
        if ($("#pokebattlerid").val() === "") {
            pokebox = defaultbox.pokemon;
            team = initteam(pokebox);
            updateTeamSelector(defaultbox);
            updateMoveButtons();
            updateSwitchButtons();
            localStorage.id = "";
            localStorage.removeItem("pokebox");
        }
        if (isNaN(id))
        $("#pokebattlerinfo").text("Please enter a valid Pokebattler ID. " + refreshbtn);
            return;
        localStorage.id = id;  //Store pokebattler id in local
        $.get("https://fight.pokebattler.com/profiles/" + id, {}, function (data) {
            try {//attempt to get data from pokebattler api based on given id
                //console.log(data);
                //teamdata = data;
                //Check here for a valid response from the api
                pokebox = data.pokemon;
                localStorage.pokebox = JSON.stringify(pokebox);
                team = initteam(pokebox);
                updateTeamSelector(data);
                updateMoveButtons();
                updateSwitchButtons();
                //console.log(data.trainer.name);
                if (data.trainer.name !== null) {
                    playername = data.trainer.name;

                }

            } catch (e) {
                $("#pokebattlerinfo").text("an error occured. make sure your first battle party has the 3 pokemon you want to use and " + refreshbtn);
                console.log(e.message);
            }
        });
        updateMoveButtons();
        updateSwitchButtons();
    }); */


    /* updateTeamSelector({"pokemon": pokebox});
    function updateTeamSelector(data) {  //team selector with data from pokebox
        //console.log(data.pokemon);
        $("#team").html("");
        var toappend = "";
        for (var i = 0; i < data.pokemon.length; i++) {
            try {
                var selected = "class='";
                if (localStorage.selected) {//this should be modified to only pick three, but it will be scrapped anyway so it doesnt matter
                    var s = JSON.parse(localStorage.selected);
                    selected += (i === s[0] || i === s[1] || i === s[2]) ? "selectedpoke" + (i === s[0] ? " lead" : "") : "";
                    selected += "'";
                } else {
                    selected = i < 3 ? "class='selectedpoke'" : "";
                    selected = i < 1 ? "class='selectedpoke lead'" : selected;
                }
                var cur = data.pokemon[i];
                //console.log(cur.pokemon);

                //This whole block can be taken out if using the pvpoke gamemaster data
                var name = cur.pokemon.replace("_FORM", "").toLowerCase().replace("_", "-").replace("_", "-");
                var name2 = name.replace("_FORM", "").replace("ALOLA", "ALOLAN").replace("-", "_");
                //this is new
                cur.quickMove = cur.quickMove.replace("_FAST","");
                var movedisp1 = cur.quickMove.includes("_") ? (cur.quickMove.substring(0,1) + cur.quickMove.split("_")[1].substring(0,1)) : cur.quickMove.substring(0,1) ;
                var movedisp2 = cur.cinematicMove.includes("_") ? (cur.cinematicMove.substring(0,1) + cur.cinematicMove.split("_")[1].substring(0,1)) : cur.cinematicMove.substring(0,1) ;
                var movedisp3 = cur.cinematicMove2.includes("_") ? (cur.cinematicMove2.substring(0,1) + cur.cinematicMove2.split("_")[1].substring(0,1)) : cur.cinematicMove2.substring(0,1) ;
                //this is new
                //console.log(cur.quickMove + " " + movedisp1);
                var movedisplay = movedisp1 + "," + movedisp2 + "," + movedisp3;

                var cp = calcCP(name2, cur.level, cur.individualAttack, cur.individualDefense, cur.individualStamina);
                //console.log("using calcp with : " + name2 + " " + cur.level + " " + cur.individualAttack + " " + cur.individualDefense + " " + cur.individualStamina + " " + cp);
                toappend += "<div " + selected + " data-name='" + name + "' data-id='" + i + "' style='background-image: url(" + spriteURL(data.pokemon[i].pokemon) + ")'>" + cp + " " + movedisplay + "</div>";
                //console.log(toappend);
                //

            } catch (e) {
                console.log(e);
            }
        }
        toappend += "<div id='newpoke'><span style='opacity:0'>a</span><span style='position:absolute;top:20px;left:35px;font-size:50px;'>+</span></div>"
        $("#team").append(toappend);
        selectedNewTeam();
    } */

    /* function selectedNewTeam(this2) {
        teamFitsInGreat = true;
        //console.log($(this));
        var len = $(".selectedpoke").length;
        $(this2).removeClass("lead");
        if ($(".lead").length === 0 && !$(this2).hasClass("selectedpoke"))
            $(this2).addClass("lead");
        $(this2).toggleClass("selectedpoke");
        len = $(".selectedpoke").length;
        //console.log(len);
        if (len === 3) {
            var party = [];
            var storage = [];
            var id = $(".lead").data("id");
            if ($(".lead").length === 1) {
                party.push(pokebox[id]);
                if (calcBoxCP(pokebox[id]) > 1501)
                    teamFitsInGreat = false;//All this checking should be done in the teambuilder upon attempt to save a team
                storage.push(id);
            }

            var leadid = id;
            for (var i = 0; i < 3; i++) {
                id = $(".selectedpoke").eq(i).data("id");
                //console.log(calcBoxCP(pokebox[id]));
                if (id === leadid)
                    continue;
                //console.log(id);
                party.push(pokebox[id]);
                storage.push(id);

                if (calcBoxCP(pokebox[id]) > 1501)
                    teamFitsInGreat = false;
            }
            //console.log(party);
            team = initteam(party);
            updateSwitchButtons();
            updateMoveButtons();
            localStorage.selected = JSON.stringify(storage);
        }
    } */




    $('body').on("click", "#chargemove1container", function (e) {//code for using charge move 1
        console.log('charge move clicked');
        if (!started || lock)
            return;
        console.log('not escaping');
        move = team[currentpoke].chargedMove1;
    });
    $('body').on("click", "#chargemove2container", function (e) {//code for using charge move 2
        console.log('charge move clicked');
        if (!started || lock)
            return;
        console.log('not escaping');
        move = team[currentpoke].chargedMove2;
    });
    $('body').on("click", ".shieldbtn", function (e) {//clicked shield button
        useShield();
    });
    $('body').on("click", "#shield1,#shield2", function (e) { //clicked shield?
        console.log($(".shieldbtn").length);
        if ($(".shieldbtn").length === 1)
            useShield();
    });
    function useShield() { //logic for using a shield
        shields--;
        shielding = true;
        socket.emit('shield', {});
        $(".shieldbtn").hide();
    }
    $('body').on("click", "#switch button", function (e) { //clicked switch button
        var at = $(this).attr("name");
        //console.log(currentpoke);
        //console.log(at);
        if (!doingcharge && currentpoke !== at){//confirm switch is possible
            move = {moveId: `switch_${at}`};
        }else{
            move = {moveId: ""};
        }
    });
    //var changedlobby = false;
    /* $("#changelobbybtn").click(function () { //changing lobbies?
        var n = Number.parseInt($("#lobbyinput").val());
        if (!isNaN(n) && n > 0 && n < 1000) {//check lobby id for being a number and in acceptable range of values
            if (started)
                return;
            changedlobby = true;
            //                    $("#ready strong").text("ready");
            socket.emit('lobbyrequest', {num: (n - 1)});
            $("#ready").click();
            $("#ready").fadeOut(0);
            $("#ready2").fadeOut(0);
            display("waiting for opponent");
        }


    }); */


    setInterval(function () {
        //set a bunch of values in the html
        cd.text(switchcd);
        shieldcount2.text(shields);
        shieldcount1.text(oshields);
        name2.html(playername);
        name1.html(enemyname);
        window.localStorage.setItem(`afktimer${playername}`, Date.now());
        //question.PNG
        if (started) { //set enemy pokemon image
            img1.css("background-image", "url(" + spriteURL(enemyteam[currentenemypoke].speciesId) + ")");
        } else {
            img1.css("background-image", "url(question.PNG)");//should only be a catch with a proper teambuilder
        }
        img2.css("background-image", "url(" + spriteURL(team[currentpoke].speciesId) + ")");//set image of your pokemon

        for (var i = 0; i < 3; i++) { //this bit of logic should probably go somewhere else
            if (currentEnemyHP[i] < 1)
                $(".enemypoke").eq(i).addClass("KOpoke");
        }
        var r = $("#ready");
        r.removeClass("button-green");
        r.removeClass("button-red");
        r.addClass(teamFitsInGreat ? "button-green" : "button-red");

        disableSwitchButton(team[currentpoke].name);
        updateHP();
        updateEn();
        if (winner >= 0) {
            if (!sentendpacket) {
                sentendpacket = true;
                socket.emit('end', {});
                var share = "<br>If you like the simulator, share it around to increase the playerbase";
                display(winner === 1 ? "you win. " + refreshbtn + share : "you lose. " + refreshbtn + share);
                winner === 1 ? window.localStorage.setItem("winner", playername) : window.localStorage.setItem("winner", enemyname);
            }

            //socket.disconnect();
        }
        if (started)
            $("#enemycp").html(enemyteam[currentenemypoke].cp + " CP");
    }, 50);

    function display(text) {
        if (!win1.html().includes("enemy disconnected"))
            win1.html(text);
    }
    function display2(text) {
        win2.html(text);
    }

    function disableSwitchButton(poke) {
        for (var i = 0; i < 3; i++) {
            $("button[name='" + i + "']").attr("disabled", currentHP[i] < 1);
        }
        $("button[name='" + poke + "']").attr("disabled", true);

        var disableall = false;
        if (!(switchcd === 0 && started))
            disableall = true;
        if (currentHP[currentpoke] < 1 && started)
            disableall = false;
        if (disableall)
            $("#switch button").attr("disabled", true);
    }

    function updateSwitchButtons() {
        if(team.length < 3){
            $("#switch3").css("display", "none");
        }
        if(team.length < 2){
            $("#switch2").css("display", "none");
        }
        for (var i = 0; i < 3; i++) {
            if(team[i]){
                $("#switch" + (i + 1)).css("background-image", "url(" + spriteURL(team[i].speciesId) + ")");
            }
        }
    }

    setInterval(function () {
        switchcd--;
        if (switchcd < 0)
            switchcd = 0;
        //replace this with code that hides the switch timer and replaces it with the switch button img
    }, 1000);

    setInitialHP = () => {
        console.log(team);
        console.log(enemyteam);
        currentHP = team.map((mon) => {
            return mon.stats.maxhp;
        });
        currentEnemyHP = enemyteam.map((mon) => {
            return mon.stats.maxhp;
        });
        console.log(`Initial HP values: ${currentHP}, ${currentEnemyHP}`);
    }

    function updateHP() {
        //                if (winner >= 0) {
        //                    display(winner === 1 ? "you win" : "you lose");
        //                    return;
        //                }
        /* if (currentHP[0] < 1 && currentHP[1] < 1 && currentHP[2] < 1)
            winner = 0;
        if (currentEnemyHP[0] < 1 && currentEnemyHP[1] < 1 && currentEnemyHP[2] < 1)
            winner = 1; */
        
        var KOcount = 0;
        currentHP.forEach(x => {
            if(x < 1) KOcount++;
            if(KOcount === team.length) winner = 0;
        });
        KOcount = 0;
        currentEnemyHP.forEach(x => {
            if(x < 1) KOcount++;
            if(KOcount === team.length) winner = 1;
        });
        
        var w1 = Math.floor((currentHP[currentpoke] / team[currentpoke].stats.maxhp) * 200);
        //console.log(currentEnemyHP[currentenemypoke]);
        //console.log(enemyteam[currentenemypoke].stats.maxhp);
        if(currentEnemyHP[currentenemypoke]){
            var w2 = Math.floor((currentEnemyHP[currentenemypoke] / enemyteam[currentenemypoke].stats.maxhp) * 200);
            $("#hp2").css({width: (w1)}); //div shortens based on amount of health
            $("#hp1").css({width: (w2)});
            $("#hp1").css({"background-color": (w2 < 100 ? (w2 < 20 ? ("red") : "yellow") : "#66ff66")});
            $("#hp2").css({"background-color": (w1 < 100 ? (w1 < 20 ? ("red") : "yellow") : "#66ff66")});
            //sets color based on width of div
        }
    }
    function updateEn() {
        //$("#enin").css({width: (team[currentpoke].energy)});
        //console.log(team[currentpoke].energy);
        $("#move1progress").css({height: (80 * energy[currentpoke] / team[currentpoke].chargedMove1.energy)});
        $("#move2progress").css({height: (80 * energy[currentpoke] / team[currentpoke].chargedMove2.energy)});
        if (energy[currentpoke] >= team[currentpoke].chargedMove1.energy) {
            $("#chargemove1btn").addClass("active")
        } else {
            $("#chargemove1btn").removeClass("active")
        }
        if (energy[currentpoke] >= team[currentpoke].chargedMove2.energy) {
            $("#chargemove2btn").addClass("active")
        } else {
            $("#chargemove2btn").removeClass("active")
        }

    }
    function updateMoveButtons() {
        //console.log(enemyteam);
        // console.log(startrecv);
        var q = team[currentpoke].fastMove.name;
        //var q2 = "unknown";
        if (enemyteam)
            if (startrecv)
                q2 = enemyteam[currentenemypoke].fastMove.name;
        $("#quickmovebtn").text(q);
        //$("#enemyquickmovebtn").text(q2.toLowerCase().replace("_", " ").replace("_", " "));
        //console.log(team[currentpoke].ctype1);
        /* for (var i = 1; i < 3; i++) {
            $("#chargemove" + i + "btn").attr("class", "movebtn noselect " + team[currentpoke].chargedMove1.type);
            $("#move" + i + "background").attr("class", team[currentpoke].chargedMove2.type);
        } */
        var c1 = team[currentpoke].chargedMove1.name;
        $("#chargemove1btn").data("name", c1);
        $("#chargemove1text").text(c1);
        $("#chargemove1btn").attr("class", "movebtn noselect " + team[currentpoke].chargedMove1.type);
        $("#move1background").attr("class", team[currentpoke].chargedMove1.type);
        
        if(team[currentpoke].chargedMove2 && team[currentpoke].chargedMove2.name){
            var c2 = team[currentpoke].chargedMove2.name;
            $("#chargemove2btn").data("name", c2);
            $("#chargemove2text").text(c2);
            $("#chargemove2btn").attr("class", "movebtn noselect " + team[currentpoke].chargedMove2.type);
            $("#move2background").attr("class", team[currentpoke].chargedMove2.type);
        }
        updateEn();
    }
    function currentQuickMove() { //this can be deleted once using pvpoke's gamemaster data
        return team[currentpoke].fastMove;
    }
    function currentQuickMoveDelay() {
        return team[currentpoke].fastMove.cooldown / 500;
    }


    function spriteURL(url) {
        var t = url.replace("_", "-").replace("alolan", "alola");
        return `./sprites/${t}.png`;
    }

    function animate(n) {
        if (n === 1)
            $("#img1").animate({top: "-40px", left: "10px"}, 240, "linear", function () {
                $("#img1").animate({top: "-50px", left: "0px"}, 240, "linear");
            });
        if (n === 2)
            $("#img2").animate({top: "40px", left: "410px"}, 240, "linear", function () {
                $("#img2").animate({top: "50px", left: "420px"}, 240, "linear");
            });
    }


    /* $("#namebtn").click(function () {

        playername = $("#nameinput").val();
        localStorage.name = playername;
    }); */
    /* function getNewPoke() { //this translates the inputs of modalwindow into raw data
        var cinematicMove = $(".modal .move-select.charged").eq(0).val();
        var cinematicMove2 = $(".modal .move-select.charged").eq(1).val();
        var quickMove = $(".modal .move-select.fast").eq(0).val();
        var individualAttack = Number.parseInt($(".modal .iv[iv='atk']").val());
        var individualDefense = Number.parseInt($(".modal .iv[iv='def']").val());
        var individualStamina = Number.parseInt($(".modal .iv[iv='hp']").val());
        var level = Number.parseFloat($(".modal .level").val());
        var pokemon = $(".modal .poke-select").val();
        console.log(pokemon);
        return {cinematicMove, cinematicMove2, quickMove, individualAttack, individualDefense, individualStamina, level, pokemon};
    } */
    /* $("html").on("click", "#addpokebtn", (function () {



        pokebox.push(getNewPoke()); //add data from modalwindow into storage
        localStorage.pokebox = JSON.stringify(pokebox);
        updateTeamSelector({pokemon: pokebox});
        closeModalWindow();
    })); */
    /* $("html").on("click", ".master-stats", (function () {
        $(".level").val("40");
        updateNewCP();
    }));
    $("html").on("click", ".ultra-stats", (function () {
        var s = $(".modal .poke-select").val();
        $(".level").val(maxTradeLevel(s)[1]);
        updateNewCP();
    }));
    $("html").on("click", ".great-stats", (function () {
        var s = $(".modal .poke-select").val();
        $(".level").val(maxTradeLevel(s)[0]);
        updateNewCP();
    })); */
    /* $("html").on("keyup", ".poke-search", function (e) {
        var searchStr = $(this).val().toLowerCase();
        //console.log(searchStr);
        if (searchStr == '')
            return;

        var pokename = gm.getPokemonById(searchStr).speciesId;
        $(".poke-select option").each(function () {
            var v = $(this).val();
            $(this).removeAttr("selected");
//                   console.log(pokename + " " + v);
            if (v === pokename) {
                $(this).attr("selected", "");
            }

        });
        pokeSelectChanged(pokename);
        updateNewCP();
        $(".great-stats").click(); //this is new
    }); */
    /* $("html").on("change", ".poke-select", function (e) {
        var selectedpoke = $(this).val();
        $(".poke-search").val(selectedpoke);
        pokeSelectChanged(selectedpoke);
    }); */
    /* $("html").on("change", ".modal *", function (e) {
        //console.log("change");
        updateNewCP();
    }); */
    /* function updateNewCP() {
        var p = getNewPoke();
        var cp = calcCP(p.pokemon, p.level, p.individualAttack, p.individualDefense, p.individualStamina);
        $(".cp .stat").html(cp);
    } */
    /* function pokeSelectChanged(poke) {
        //console.log(poke);
        var pokegm = gm.getPokemonById(poke);

        var fastmoves = "";
        for (var i = 0; i < pokegm.fastMoves.length; i++) {
            var m = pokegm.fastMoves[i];
            var m2 = m.toLowerCase().replace("_", " ");
            var selected = i === 0 ? "selected" : "";
            fastmoves += "<option " + selected + "  value='" + m + "'>" + m2 + "</option>"
        }
        //console.log(fastmoves);
        $(".move-select.fast").html(fastmoves);

        var chargemoves = "";
        for (var i = 0; i < pokegm.chargedMoves.length; i++) {
            var m = pokegm.chargedMoves[i];
            var m2 = m.toLowerCase().replace("_", " ");
            var selected = i === 1 ? "selected" : "";
            chargemoves += "<option " + selected + " value='" + m + "'>" + m2 + "</option>"
        }
        $(".move-select.charged").html(chargemoves);

    } */

    socket.on("playersinmodes", function (data) {
        $("#playersgreat").html(data.great);
        $("#playersmaster").html(data.master);
    });

    /* $("#search").on("keydown", function () { //this whole thing is new
        setTimeout(function () {
            var s = $("#search").val();
            console.log(s);
            $("#team div").each(function(){
                var el = $(this);
                if(el.attr("id")=== "newpoke")return;
                el.show();
               if(!el.data("name").includes(s)){
                   el.hide();
               }
            });
        }, 0);

    }) */
});