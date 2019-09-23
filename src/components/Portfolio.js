import React from "react";
import StocksFromAlphaVantage from "./Stocks";
import "../Portfolio.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "react-table/react-table.css";

export default class Portfolio extends React.Component {
  constructor() {
    super();
    this.StockId = 0;
    this.body = "";
    this.amount = 0;
    this.lastRefreshed = "";
    this.currentPriceToShow = 0;
    this.stockTotalValueToShow = 0;
    this.startDate = new Date();
    this.lastDate = new Date();
    this.isChecked = true;
    this.metaData = [];
    this.dailyData = [];
    this.columns = [
      { Header: "StockName", fieldname: "body" },
      { Header: "StockPrice", fieldname: "currentPriceToShow" },
      { Header: "Amount", fieldname: "amount" },
      { Header: "Total stock price", fieldname: "stockTotalValueToShow" }
    ];
    this.state = {
      stockArray: [],
      checkedArray: []
    };
  }

  /**State for the addStock window */
  state = {
    addStockVisible: false
  };

  /**State for the showGraph window */
  state = {
    addGraphVisible: false
  };

  /**State to show USD */
  state = {
    showUSD: true
  };

  /**Adding the stock to a copy of the stockArray,
   * will be added later if the stock entered is valid in
   * the method getStockData */
  addStock = () => {
    if (this.state.stockArray.length >= 50) {
      alert("You can not add more than 50 stocks in a portfolio");
    } else {
      /**Method for getting the stock data */
      this.getStockData();
    }
  };

  /*Storing the stock name */
  newStock = element => {
    this.body = element.target.value.toUpperCase();
  };

  /**Storing the amount of certain stock */
  newStockAmount = element => {
    this.amount = element.target.value;
  };

  /**Storing the first selected date for the graph */
  setGraphStartDate = element => {
    this.startDate = element.target.value;
    this.generateGraphLines();
    this.generateGraphRows();
  };

  /**Storing the last selected date for the graph */
  setGraphEndDate = element => {
    this.lastDate = element.target.value;
    this.generateGraphLines();
    this.generateGraphRows();
  };

  /**Changes the checked state for the checkboxes for the graph */
  changeChecked = element => {
    if (this.state.checkedArray.includes(element.target.id)) {
      this.isChecked = false;
      var indexToBeRemoved = 0;
      for (var i = 0; i < this.state.checkedArray.length; i++) {
        if (this.state.checkedArray[i] === element.target.id) {
          indexToBeRemoved = i;
        }
      }
      this.state.checkedArray.splice(indexToBeRemoved, 1);
    } else {
      this.isChecked = true;
      this.state.checkedArray.push(element.target.id);
    }
  };

  /**Delete stock from portfolio */
  deleteStock = index => {
    const copyStockArray = Object.assign([], this.state.stockArray);
    copyStockArray.splice(index, 1);
    this.setState({
      stockArray: copyStockArray
    });
  };

  /**Method for getting the stock data from alphavantage */
  async getStockData() {
    /**Checks if the just added stock already is in the portfolio, if true it will not add it again */
    var stockAlreadyExists = false;
    for (var j = 0; j < this.state.stockArray.length; j++) {
      if (this.state.stockArray[j].body === this.body) {
        stockAlreadyExists = true;
        alert(
          "The stock you entered is already in your portfolio, you cannot add the same stock again"
        );
      }
    }
    /**If the stock is not present in the portfolio this will query API */
    if (!stockAlreadyExists) {
      /*"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=HRVEIW5PUW3N2CRS"*/
      /*Url parameters */
      const url1 = "https://www.alphavantage.co/query?function=";
      const url2 = "&outputsize=full&symbol=";
      const url3 = "&apikey=";
      const series = "TIME_SERIES_DAILY";
      const symbol = this.body;
      const apikey = "HRVEIW5PUW3N2CRS";

      /*Request to alphavantage */
      const url = url1.concat(series, url2, symbol, url3, apikey);
      const response = await fetch(url);
      const data = await response.json();

      /**Storing the stock data */
      this.metaData = data["Meta Data"];
      this.dailyData = data["Time Series (Daily)"];

      this.setState({ loading: false });

      /**If the stock can not be found the stock is not added to the portfolio */
      if (data["Meta Data"] === undefined) {
        alert(
          "The symbol for the stock you entered can not be found, try again"
        );
      } else if (isNaN(this.amount)) {
        alert(
          "The number of the amount of stocks has to be a number, try again"
        );
      } else if (this.amount <= 0) {
        alert(
          "The number of the amount of stocks has to be atleast 1, try again"
        );
      } else {
        /**Storing the stock data that need values to work */
        this.lastRefreshed = data["Meta Data"]["3. Last Refreshed"].substring(
          0,
          10
        );
        this.currentPriceToShow =
          data["Time Series (Daily)"][this.lastRefreshed]["4. close"];
        this.currentPriceToShow =
          Math.round(this.currentPriceToShow * 100) / 100;
        this.stockTotalValueToShow = this.currentPriceToShow * this.amount;

        this.startDate = new Date(
          new Date().setDate(new Date().getDate() - 100)
        ).toLocaleDateString("en-CA");
        this.lastDate = new Date().toLocaleDateString("en-CA");
        this.isChecked = true;
        this.StockId = this.StockId + 1;
        const copyStockArray = Object.assign([], this.state.stockArray);
        copyStockArray.push({
          StockId: this.StockId,
          body: this.body,
          amount: this.amount,
          metaData: this.metaData,
          dailyData: this.dailyData,
          startDate: this.startDate,
          lastDate: this.lastDate,
          isChecked: this.isChecked,
          lastRefreshed: this.lastRefreshed,
          stockTotalValueToShow: this.stockTotalValueToShow,
          currentPriceToShow: this.currentPriceToShow
        });
        const copyCheckedArray = Object.assign([], this.state.checkedArray);
        copyCheckedArray.push(this.body);

        this.setState({
          stockArray: copyStockArray,
          checkedArray: copyCheckedArray
        });
        alert("The stock " + this.body + " has been added to the portfolio!");
      }
    }
  }

  /**Methods for changing the currency from USD to EUR */
  changeExchangeRateUSDEUR = () => {
    this.setState({ showUSD: false }, this.getExchangeRateUSDEUR);
  };

  async getExchangeRateUSDEUR() {
    //https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=HRVEIW5PUW3N2CRS
    /*Url parameters */
    const url1 = "https://www.alphavantage.co/query?function=";
    const fromToCurrency = "&from_currency=USD&to_currency=EUR&apikey=";
    const series = "CURRENCY_EXCHANGE_RATE";
    const apikey = "HRVEIW5PUW3N2CRS";

    /*Request to alphavantage */
    const url = url1.concat(series, fromToCurrency, apikey);
    const response = await fetch(url);
    const data = await response.json();

    var rate = parseFloat(
      data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
    );
    var newPrice = this.currentPriceToShow * rate;
    this.setState({ currentPriceToShow: newPrice });
    console.log("Current price to show: " + newPrice);
  }

  /**Methods for changing the currency from EUR to USD */
  changeExchangeRateEURUSD = () => {
    this.setState({ showUSD: true });
    this.getExchangeRateEURUSD();
  };

  async getExchangeRateEURUSD() {
    //https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=HRVEIW5PUW3N2CRS
    /*Url parameters */
    const url1 = "https://www.alphavantage.co/query?function=";
    const fromToCurrency = "&from_currency=EUR&to_currency=USD&apikey=";
    const series = "CURRENCY_EXCHANGE_RATE";
    const apikey = "HRVEIW5PUW3N2CRS";

    /*Request to alphavantage */
    const url = url1.concat(series, fromToCurrency, apikey);
    const response = await fetch(url);
    const data = await response.json();

    var rate = parseFloat(
      data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
    );
    var newPrice = this.currentPriceToShow * rate;
    this.setState({ currentPriceToShow: newPrice });
    console.log("Current price to show: " + this.currentPriceToShow);
  }

  /**Method for calculating the value of the whole portfolio */
  calculatePortfolioPrice = () => {
    var totalValue = 0;
    for (var i = 0; i < this.state.stockArray.length; i++) {
      totalValue += this.state.stockArray[i].stockTotalValueToShow;
    }
    return totalValue;
  };

  /**Getting the correct status for if a stock is selected or not */
  getCheckedStatus = key => {
    if (this.state.checkedArray.includes(key)) {
      return true;
    } else {
      return false;
    }
  };

  /**Mehtod for creating the list of stocks for the graph */
  createListOfStocks = () => {
    let table = [];
    for (var i = 0; i < this.state.stockArray.length; i++) {
      table.push(<tr></tr>);
      table.push(
        <td key={this.state.stockArray[i].body}>
          <input
            type="checkbox"
            defaultChecked={this.getCheckedStatus(
              this.state.stockArray[i].body
            )}
            onChange={this.changeChecked}
            name={this.state.stockArray[i].body}
            id={this.state.stockArray[i].body}
          />
        </td>
      );
      table.push(
        <td key={this.state.stockArray[i].body}>
          {this.state.stockArray[i].body}
        </td>
      );
    }
    return table;
  };

  /**Generating data for all the stocks in the portfolio */
  generateGraphRows = () => {
    const rows = [];
    var count = 0;
    var rowcount = 0;
    var longestStockIndex = 0;
    var length = 0;
    var currentLongestLength = 0;

    /**Finding stock with data furthest back to prevent array index out of bounds later */
    for (var k = 0; k < this.state.stockArray.length; k++) {
      if (this.state.checkedArray.includes(this.state.stockArray[k].body)) {
        for (var date in this.state.stockArray[k].dailyData) {
          length += 1;
        }
        if (length > currentLongestLength) {
          currentLongestLength = length;
          longestStockIndex = k;
        }
        length = 0;
      }
    }
    /**This switches the stock with the longest values first to the array */
    if (longestStockIndex !== 0) {
      this.state.stockArray.unshift(this.state.stockArray[longestStockIndex]);
      longestStockIndex += 1;
      this.state.stockArray.splice(longestStockIndex, 1);
    }

    /**Looping through all the stocks */
    for (var i = 0; i < this.state.stockArray.length; i++) {
      if (this.state.checkedArray.includes(this.state.stockArray[i].body)) {
        const timeSeries = this.state.stockArray[i].dailyData;
        const stock = this.state.stockArray[i].body;

        /**Adding each of the stocks to the rows */
        for (var date in timeSeries) {
          if (date < this.startDate || date > this.lastDate) {
          } else {
            if (timeSeries[date]) {
              const stockData = timeSeries[date];
              const close = stockData["4. close"];

              /**If there already is something added to rows this will add the new stocks to the same dates*/
              if (count >= 1) {
                if (rows[rowcount]["date"] === date) {
                  rows[rowcount][stock] = close;
                  rowcount -= 1;
                }
              } else {
                rows.unshift({
                  date: date
                });
                rows[0][stock] = close;
              }
            }
          }
        }
        rowcount = rows.length - 1;
        count += 1;
      }
    }
    return rows;
  };

  /**Generating Lines for the graph */
  generateGraphLines = () => {
    const test = [];
    /**Looping through all the stocks */
    for (var i = 0; i < this.state.stockArray.length; i++) {
      test.push(this.state.stockArray[i].body);
    }
    return test;
  };

  render() {
    return (
      <div className="OnePortfolio">
        <strong>{this.props.body}</strong>
        <br />
        <strong>Portfiolio total price:</strong>{" "}
        {this.calculatePortfolioPrice()}
        <div>
          <br />
          <br />
          <ul>
            {this.state.stockArray.map((body, index) => {
              return (
                <StocksFromAlphaVantage
                  key={body.id}
                  id={body.id}
                  body={body.body}
                  currentPriceToShow={body.currentPriceToShow}
                  stockTotalValueToShow={body.stockTotalValueToShow}
                  amount={body.amount}
                  delete={this.deleteStock.bind(this, index)}
                />
              );
            })}
          </ul>
          <div className="PortfolioButtons">
            <button
              className="AddStock"
              data-modal-target="#addStockPopup"
              onClick={e => this.setState({ addStockVisible: true })}
            >
              Add stock
            </button>
            <button
              className="PerfGraph"
              data-modal-target="#addGraphPopup"
              onClick={e => this.setState({ addGraphVisible: true })}
            >
              Perf graph
            </button>
            <button
              className="ChangeCurrency"
              onClick={this.changeExchangeRateUSDEUR}
            >
              Display in €
            </button>
            <button
              className="ChangeCurrency"
              onClick={this.changeExchangeRateEURUSD}
            >
              Display in $
            </button>
            <button className="DeletePortfolio" onClick={this.props.delete}>
              Delete
            </button>
          </div>

          {/**Add stock popup window */}
          {this.state.addStockVisible ? (
            <div className="addStockPopup" id="addStockPopup">
              <div className="addStockPopupHeader">
                <div className="title">Add stock to portfolio</div>
                <button
                  className="close-button"
                  onClick={e => this.setState({ addStockVisible: false })}
                >
                  X
                </button>
              </div>
              <div className="addStockPopupBody">
                Symbol name of stock:{" "}
                <input type="text" onBlur={this.newStock} />
                <br />
                Amount of shares owned:{" "}
                <input type="text" onBlur={this.newStockAmount} />
                <br />
                <br />
                <button onClick={this.addStock}>Add stock to portfolio</button>
                <br />
                (The fetching of the stock values might take a while, be
                patient)
              </div>
              <div id="overlay"></div>
            </div>
          ) : null}

          {/**Add graph popup window */}
          {this.state.addGraphVisible ? (
            <div className="addGraphPopup" id="addGraphPopup">
              <div className="addGraphPopupHeader">
                <div className="title">Stock Performance Graph</div>
                <button
                  className="close-button"
                  onClick={e => this.setState({ addGraphVisible: false })}
                >
                  Close
                </button>
              </div>
              <div className="addGraphPopupBody">
                <div className="stockList">
                  List stocks here: <br />
                  <table>
                    <tbody>{this.createListOfStocks()}</tbody>
                  </table>
                </div>
                <div className="graph">
                  <ResponsiveContainer>
                    <LineChart
                      width={600}
                      max-width={80}
                      height={300}
                      data={this.generateGraphRows()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis type="number" domain={[0, 300]} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      {this.generateGraphLines().map(id => {
                        return (
                          <Line type="monotone" dataKey={id} dot={false} />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="graphDates">
                  <input
                    type="date"
                    id="startDate"
                    name="Stock start date"
                    onChange={this.setGraphStartDate}
                    defaultValue={new Date(
                      new Date().setDate(new Date().getDate() - 100)
                    ).toLocaleDateString("en-CA")}
                  ></input>
                  <input
                    type="date"
                    id="endDate"
                    name="Stock end date"
                    onChange={this.setGraphEndDate}
                    defaultValue={new Date().toLocaleDateString("en-CA")}
                  ></input>
                  <button onClick={this.generateGraphRows}>Apply date</button>
                </div>
              </div>
              <div id="overlay"></div>
            </div>
          ) : null}

          <br />
        </div>
      </div>
    );
  }
}
