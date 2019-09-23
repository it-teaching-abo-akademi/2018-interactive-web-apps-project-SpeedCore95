import React from "react";
import "./App.css";
import { Header } from "./components/Header";
import Portfolio from "./components/Portfolio";

export default class App extends React.Component {
  constructor() {
    super();
    this.portfolioId = 0;
    this.body = "";
    this.portfolioPrice = 0;
    this.state = {
      portfolioArray: []
    };
  }

  /**Method for deleting the selected portfolio */
  deletePortfolio = index => {
    const copyPortfolioArray = Object.assign([], this.state.portfolioArray);
    copyPortfolioArray.splice(index, 1);
    this.setState({
      portfolioArray: copyPortfolioArray
    });
  };

  /**Storing the value of the portfolio to be added */
  newPortfolio = element => {
    this.body = element.target.value;
  };

  /**Method for adding a portfolio */
  addPortfolio = () => {
    if (this.state.portfolioArray.length >= 10) {
      alert("You can not create more than 10 portfolios");
    } else {
      var alreadyExists = false;
      /**Prevents an portfolio with the same name to be made */
      for (var i = 0; i < this.state.portfolioArray.length; i++) {
        if (
          this.body.toLowerCase() ===
          this.state.portfolioArray[i].body.toLowerCase()
        ) {
          console.log(this.body.toLowerCase());
          alert("Portfolio with the same name already exists, try again!");
          alreadyExists = true;
        }
      }
      if (!alreadyExists) {
        this.portfolioId = this.portfolioId + 1;
        const copyPortfolioArray = Object.assign([], this.state.portfolioArray);
        copyPortfolioArray.push({
          id: this.portfolioId,
          body: this.body
        });
        this.setState({
          portfolioArray: copyPortfolioArray
        });
      } else {
        alreadyExists = false;
      }
    }
  };

  /**Updates to total price for a portfolio */
  changePortfolioPrice = totalPrice => {
    this.portfolioPrice = totalPrice;
  };

  render() {
    return (
      <div className="App">
        <Header title={"Welcome to your SPMS!"} />
        <input type="text" onBlur={this.newPortfolio} />
        <button onClick={this.addPortfolio}>Add Portfolio</button>
        <ul>
          <div className="PortfolioItem">
            {this.state.portfolioArray.map((body, index) => {
              return (
                <Portfolio
                  key={body.id}
                  id={body.id}
                  body={body.body}
                  delete={this.deletePortfolio.bind(this, index)}
                />
              );
            })}
          </div>
        </ul>
      </div>
    );
  }
}
