import React from "react";

export default class StocksFromAlphaVantage extends React.Component {
  render() {
    return (
      /**The display settings of how a stock is presented in the portfolio */
      <div>
        Stock: {this.props.body} Current price: {this.props.currentPriceToShow}{" "}
        Amount: {this.props.amount} Total value:{" "}
        {this.props.stockTotalValueToShow}
        <button onClick={this.props.delete}>X</button>
      </div>
    );
  }
}
