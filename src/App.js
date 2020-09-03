import React, { Component } from "react";
import "./App.css";
import PubNub from "pubnub";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVal: "",
      submarines: [],
      presenceMessages: [],
      messages: [],
      registerDisable: false,
    };
    this.pubnub = new PubNub({
      publishKey: "pub-c-de60b6e2-c5e1-4a21-bd01-80057f77b665",
      subscribeKey: "sub-c-98c5c962-ecec-11ea-a728-4ec3aefbf636",
      uuid: PubNub.generateUUID(),
    });
  }

  componentDidMount() {
    this.pubnub.subscribe({
      channels: ["channel1"],
      withPresence: true,
    });

    this.pubnub.addListener({
      message: event => {
        this.displayMessages(event.message);
      },
      presence: event => {
        let presenceMessages = [...this.state.presenceMessages];
        presenceMessages.push(event);
        this.setState({ presenceMessages });
      },
    });
  }

  displayMessages = message => {
    if (message.update === "register") {
      let filteredArr;
      filteredArr = this.state.submarines.filter(
        submarine => submarine.name === message.value
      );
      if (filteredArr.length) this.setState({ registerDisable: true });
      else {
        this.setState({
          submarines: [
            ...this.state.submarines,
            { name: message.value, hideStatus: false },
          ],
          registerDisable: false,
        });
      }
    } else {
      let filetredArr;
      let arr = this.state.submarines.filter(
        submarine => submarine.name !== message.value
      );
      filetredArr = this.state.submarines
        .filter(submarine => submarine.name === message.value)
        .map(sub => {
          return { ...sub, hideStatus: true };
        });
      this.setState({
        submarines: [...arr, ...filetredArr],
        messages: [...this.state.messages, message.value],
      });
    }
  };
  handleChange = e => {
    this.setState({ inputVal: e.target.value });
  };
  handleClick = async e => {
    e.preventDefault();
    await this.pubnub.publish({
      channel: "channel1",
      message: { update: "register", value: this.state.inputVal },
    });
    this.setState({ inputVal: "" });
  };
  componentWillUnmount() {
    this.pubnub.unsubscribe({
      channels: ["channel1"],
    });
  }
  handleHide = async user => {
    await this.pubnub.publish({
      channel: "channel1",
      message: { update: "hide", value: user },
    });
  };
  render() {
    let {
      inputVal,
      messages,
      submarines,
      presenceMessages,
      registerDisable,
    } = this.state;
    return (
      <div className="App">
        <div className="container-fluid main-layout">
          <form
            style={{
              padding: 20,
              backgroundColor: "#f2f5f6",
              marginBottom: 20,
            }}
          >
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Name</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                placeholder="Enter name"
                value={inputVal}
                onChange={this.handleChange}
              />
              {registerDisable ? (
                <div className="alert alert-danger" role="alert">
                  Re-register with a proper name
                </div>
              ) : null}
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              onClick={this.handleClick}
            >
              Register
            </button>
          </form>
          <div className="row">
            <div className="col-6">
              <ul>
                {presenceMessages.map(item => (
                  <li key={item.uuid}>
                    [PRESENCE: {item.action} ], uuid: {item.uuid} , channel:{" "}
                    {item.channel}
                  </li>
                ))}
                {messages.map(item => (
                  <li key={item}>
                    <span>{item} </span> hide
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6">
              <ul>
                {submarines.map((m, index) => {
                  return !m.hideStatus ? (
                    <li
                      style={{ width: "50%", marginBottom: 10 }}
                      key={"message" + index}
                    >
                      <span>{m.name}</span>
                      <button
                        className="hide-btn"
                        onClick={() => this.handleHide(m.name)}
                      >
                        Hide
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
