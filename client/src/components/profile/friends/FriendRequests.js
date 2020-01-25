import React, { Component } from 'react';
import axios from 'axios';
import RequestItem from './RequestItem';

class FriendRequests extends Component {
    _isMounted = false;
    state = {
        statusText: ""
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    acceptRequest = (request) => {
        const {_id} = this.props;
        axios.post(`/api/users/requests/accept/${_id}`, request)
        .then(res => {
            console.log(res);
            if(res.data.success){
                axios.get(`/api/users/requests/${_id}`).then(res1 => {
                    this.props.updateFriendRequests(res1.data);
                });
                axios.get(`/api/users/friends/${_id}`).then(res1 => {
                    this.props.updateFriendList(res1.data);
                });
                this.setState({statusText: "Request accepted!"});
                setTimeout(() => {
                    if(this._isMounted)
                        this.setState({statusText: ""});
                }, 3000);
            }
            else{
                console.log("Something went wrong.")
            }
        });
    }

    denyRequest = (request) => {
        const {_id} = this.props;
        axios.post(`/api/users/requests/deny/${_id}`, request).then(res => {
            console.log(res);
            axios.get(`/api/users/requests/${_id}`).then(res1 => {
                this.props.updateFriendRequests(res1.data);
            });
            axios.get(`/api/users/friends/${_id}`).then(res1 => {
                this.props.updateFriendList(res1.data);
            });
            this.setState({statusText: "Request accepted!"});
            setTimeout(() => {
                if(this._isMounted)
                    this.setState({statusText: ""});
            }, 3000);
        })
    }

    render() {
        const {requests} = this.props;
        const {statusText} = this.state;
        
        return (
            <div className="friendrequests">
                <p>{statusText}</p>
                <div className="friendlist">
                    {requests.map((request) => (
                        <RequestItem key={Math.random()}
                            request={request}
                            acceptRequest={this.acceptRequest}
                            denyRequest={this.denyRequest}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default FriendRequests;