import React from "react";
import logo from "../logo.svg";

export class Header extends React.Component {
  render() {
    return (
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* This title can be used as the portfolio title */}
        <h1 className="App-title">{this.props.title}</h1>{" "}
        {/* Example of how to display object values <div>{this.props.myObj.b}</div>*/}
      </header>
    );
  }
}
