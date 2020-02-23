import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/Home';
import FreePlayMode from './components/free_play_mode/FreePlayMode';
import Login from './components/Login';
import Profile from './components/profile/Profile';


class App extends Component {
  state = {
    userActive: false,
    openMenu: false,
    currentUser: {},
    profileSRC: "",
    challenged: false,
    otherSocketId: "",
    privacyPacket: {status: false}
  }

  componentDidMount() {
    window.localStorage.clear()
  }

  setCurrentUser = (user) => {
    if(user._id){
      this.setState({
        currentUser: user,
        profileSRC: user.favorite.includes('default') ?
            `${process.env.PUBLIC_URL}/defaultprofile/${user.favorite}.png` :
            `${process.env.PUBLIC_URL}/sprites/${user.favorite}.png`
      });
    }
  }

  prepareForLogout = () => {
    if(this.state.currentUser._id){
      console.log("Ready to logout.");
      this.setState({userActive: true});
    }
  }

  removeCurrentUser = () => {
    this.setState({
      currentUser: {},
      userActive: false,
      openMenu: false
    });
  }

  challengeAccepted = (socketId, packet) => {
    window.localStorage.setItem('PrivacyPacket',JSON.stringify(packet));
    this.setState({challenged: true, otherSocketId: socketId, privacyPacket: packet});
  }

  setPrivacyPacket = (packet) => {
    console.log(packet);
    window.localStorage.setItem('PrivacyPacket', JSON.stringify(packet));
    this.setState({privacyPacket: packet});
  }

  removeChallengedStatus = () => {
    this.setState({challenged:false});
  }

  updateFriendRequests = (requests) => {
    this.setState({currentUser: {...this.state.currentUser, requests}});
  }

  updateFriendList = (friends) => {
    this.setState({currentUser: {...this.state.currentUser, friends}});
  }

  menuClicked = () => {
    this.setState({openMenu: !this.state.openMenu});
  }

  renderMenu = () => {
    if(this.state.openMenu){
      return(
        <div className="menu">
          <Link className="link" onClick={this.menuClicked} to="/">Home</Link>
          <Link className="link" onClick={this.menuClicked} to="/freeplay">Free Play Mode</Link>
          <Link className="link" onClick={this.menuClicked} to="/login">{this.state.userActive ? "Logout" : "Login"}</Link>
          <Link className="link" onClick={this.menuClicked} to="/profile">Profile</Link>
        </div>
      )
    }
  }

  render() {
    var {userActive, currentUser, profileSRC, challenged, privacyPacket, otherSocketId} = this.state;

    return(
      <Router> 
        <div className="App">
          <Header userActive={userActive} menuClicked={this.menuClicked}/>
          {this.renderMenu()}
          <Switch className="body">
            <Route exact path="/" render={(props) => <Home {...props} currentUser={currentUser}/>}/>
            <Route path="/freeplay" render={(props) =>
               <FreePlayMode {...props}
                currentUser={currentUser}
                challenged={challenged}
                privacyPacket={privacyPacket}
                otherSocketId={otherSocketId}
                setPrivacyPacket={this.setPrivacyPacket}
                removeChallengedStatus={this.removeChallengedStatus}/>}/>
            <Route path="/login" render={(props) =>
               <Login {...props} 
               userActive={userActive} 
               currentUser={currentUser}
               setCurrentUser={this.setCurrentUser}
               prepareForLogout={this.prepareForLogout}
               removeCurrentUser={this.removeCurrentUser}/>}/>
            <Route path="/profile" render={(props) =>
            <Profile {...props}
              currentUser={currentUser}
              updateFriendRequests={this.updateFriendRequests}
              updateFriendList={this.updateFriendList}
              profileSRC={profileSRC}
              setCurrentUser={this.setCurrentUser}
              challengeAccepted={this.challengeAccepted}
            />}/>
          </Switch>
          <Footer/>
        </div>
      </Router>
    );
  }
}

export default App;