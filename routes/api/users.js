const express = require('express');
const User = require('../../models/User');
const app = express();


//Modify the user request used for login, so that if the user is logged in
//(A db property that you will add) then it will send a Forbidden status instead of 200

// @route /api/users
// @desc Get all users
// @access Public
app.get('/', (req, res) => {
    User.find().then(users => res.json(users)).catch(err => res.json(err));
});

// @route /api/users/name/:username
// @desc Get one user by username
// @access Public
app.get('/name/:username', (req, res) => {
    User.find({username: req.params.username})
    .then(results => results.length > 0 ? res.json(results[0]): res.sendStatus(400))
    .catch(err => res.json(err));
});

// @route /api/users/search/:username
// @desc Get all users containing username, not case sensitive
// @access Public
app.get('/search/:username', (req, res) => {
    var name = JSON.stringify(req.params.username);
    name = JSON.parse(name.toLowerCase());
    User.find({usernameNCS: {$regex: name}})
    .then(results => res.json(results))
    .catch(err => res.json(err));
});

// @route /api/users/email/:email
// @desc Get one user by email
// @access Public
app.get('/email/:email', (req, res) => {
    User.find({email: req.params.email}).then(results => results.length > 0 ? res.json(results[0]): res.sendStatus(400)).catch(err => res.json(err));
});

//@route /api/users/:id
// @desc Get user by Id
// @access Public
app.get('/:id', (req, res) => {
    User.findById(req.params.id).then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/add
// @desc Post user
// @access Public
app.post('/add', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        usernameNCS: req.body.username.toLowerCase(),
        password: req.body.password,
        email: req.body.email,
        pokebox: req.body.pokebox,
        teams: req.body.teams,
        friends: req.body.friends,
        requests: req.body.requests,
        challenges: req.body.challenges,
        favorite: req.body.favorite
    });
    newUser.save().then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/pokebox/:id
// @desc Get the user's pokebox by id
// @access Public
app.get('/pokebox/:id', (req, res) => {
    User.findById(req.params.id).then(user => res.json(user.pokebox)).catch(err => res.json(err));
});


// @route /api/users/update/addbox/:id
// @desc Add Pokemon to user's pokebox
// @access Public
app.post('/update/addbox/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$push: {pokebox: req.body}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/update/addteam/:id
// @desc Create new team for user
//@access Public
app.post('/update/addteam/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$push: {teams: req.body}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});


// @route /api/users/update/updateteam/:id
// @desc Update existing team within user
// @access Public
app.post('/update/updateteam/:id', (req, res) => {
    User.findOneAndUpdate({_id: req.params.id, 'teams.id': req.body.id},
    {$set: {'teams.$': req.body}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/friends/:id
// @desc Get all friends of a user
// @access Public
app.get('/friends/:id', (req, res) => {
    User.findById(req.params.id).then(user => res.json(user.friends)).catch(err => res.json(err));
});

// @route /api/users/requests/:id
// @desc Get all friend requests for a user
// @access Public
app.get('/requests/:id', (req, res) => {
    User.findById(req.params.id).then(user => res.json(user.requests)).catch(err => res.json(err));
});

// @route /api/users/favorite/:id
// @desc Get the favorite of the user
// @access Public
app.get('/favorite/:id', (req, res) => {
    User.findById(req.params.id).then(user => res.json(user.favorite)).catch(err => res.json(err));
});

// @route /api/users/requests/send/:id
// @desc Send request to user for friendship
// @access Public
app.post('/requests/send/:id', (req,res) => {
    var exists = false;
    User.findById(req.params.id).then(user => {
        for(i=0; i<user.requests.length; i++){
            if(user.requests[i].username === req.body.username){
                res.json({success: false});
                exists = true;
            }
        }
        for(i=0; i<user.friends.length; i++){
            if(user.friends[i].username === req.body.username){
                res.json({success: false});
                exists = true;
            }
        }
        if(!exists){
            User.findByIdAndUpdate(req.params.id, {$push: {requests: req.body}}, {new: true})
            .then(user1 => res.json({
                _id: user1._id,
                username: user1.username
            })).catch(err => res.json(err));
        }
    }).catch(err => res.json(err));
});

// @route /api/users/requests/accept/:id
// @desc Accept users friend request and add friend to users' friend lists
// @access Public
app.post('/requests/accept/:id', (req, res) => {
    var firstUsername = "";
    var user2 = {};
    User.findByIdAndUpdate(req.params.id, {$push: {friends: req.body}}, {new: true})
    .then(user => {
        firstUsername = user.username;
        User.findByIdAndUpdate(req.body._id, {$push: {friends: {
            _id: req.params.id,
            username: firstUsername
        }}}, {new: true})
        .then(userRes => {
            user2 = userRes;
        }).catch(err => res.json(err));
        User.findByIdAndUpdate(req.params.id, {$pull: {requests: req.body}}).then(user => res.json({
            user1: user,
            user2: user2,
            success: true
        })).catch(err => res.json({
            err: err,
            success: false
        }));
    }).catch(err => res.json({
        err: err,
        success: false
    }));
    
});

// @route /api/users/requests/deny/:id
// @desc Deny friend request for user with given id, request in body
// @access Public
app.post('/requests/deny/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$pull: {requests: req.body}}).then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/friends/remove/:id
// @desc Remove friend from both friend lists
// @access Public
app.post('/friends/remove/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$pull: {friends: req.body}}).then(user1 => {
        User.findByIdAndUpdate(req.body._id, {$pull: {friends: {
            _id: user1._id,
            username: user1.username
        }}}).then(user2 => res.json({user1, user2, success: true})).catch(err => res.json(err));
    }).catch(err => res.json(err));
});


// @route /api/users/battle/send/:id
// @desc Send challenge request to a friend
// @access Public
app.post('/battle/send/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$push: {challenges: req.body}}, {new: true})
    .then(user => res.json({
        _id: user._id,
        username: user.username,
        challenges: user.challenges
    })).catch(err => res.json(err));
});

// @route /api/users/battle/deny/:id
// @desc deny a battle request
// @access Public
app.post('/battle/deny/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$pull: {challenges: req.body}}).then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/battle/accept/:id
// @desc accept a battle request
// @access Public
app.post('/battle/accept/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$pull: {challenges: req.body}}).then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/update/email/:id
// @desc Update email for a user
// @access Public
app.post('/update/email/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$set: {email: req.body.email}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/users/update/password/:id
// @desc Change password for a user
// @access Public
app.post('/update/password/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$set: {password: req.body.password}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/uisers/update/favorite/:id
// @desc Change the favorite Pokemon of the user
// @access Public
app.post('/update/favorite/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$set: {favorite: req.body.favorite}}, {new: true})
    .then(user => res.json(user)).catch(err => res.json(err));
});

module.exports = app;