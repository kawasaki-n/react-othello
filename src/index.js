import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const cellTypes = ["empty", "black", "white"];

class Square extends React.Component {
  render() {
    return (
      <div className="square" style={{top: this.props.top, left:this.props.left}} onClick={() => this.props.onClick()}>
        <div className="square-cell">
          <div className={"square-"+cellTypes[this.props.value]}></div>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {
  renderSquare(x, y, value) {
    return <Square key={x+","+y} top={y*32} left={x*32} value={value} onClick={() => this.props.onClick(x, y)} />;
  }

  render() {
    const boardDom = [];
    for (let y = 0; y < this.props.squares.length; y++) {
      for (let x = 0; x < this.props.squares[y].length; x++) {
        boardDom.push(this.renderSquare(x, y, this.props.squares[y][x]));
      }
    }
    return (
      <div>
        {boardDom}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const currentTurn = 1;
    this.state = {
      squares: Array(8).fill(null),
      turn: currentTurn,  // 1:black, 2:white
      status: cellTypes[currentTurn] + " move",
    }
    for (let i = 0; i < this.state.squares.length; i++) {
      this.state.squares[i] = Array(8).fill(0);
    }
    this.state.squares[3][3] = 1;
    this.state.squares[4][4] = 1;
    this.state.squares[3][4] = 2;
    this.state.squares[4][3] = 2;
  }

  handleClick(x, y) {
    const currentSquares = this.state.squares.slice();
    const currentTurn = this.state.turn;

    const flipables = this.checkPutable(x, y, currentTurn, currentSquares);

    if (flipables.length > 0) {
      this.executeFlip(flipables, currentSquares, currentTurn);
      currentSquares[y][x] = currentTurn;
      const nextTurn = this.turnChange(currentSquares, currentTurn);

      if (nextTurn === 0) {
        // Game End
        let status;
        const {winner, blackCount, whiteCount} = this.judgeWinner(currentSquares);
        if (winner === 0) {
          status = "draw (blackCount: " + blackCount + " whiteCount: " + whiteCount + ")";
        } else {
          status = cellTypes[winner] + " win (blackCount: " + blackCount + " whiteCount: " + whiteCount + ")";
        }
        this.setState({
          squares: currentSquares,
          turn: nextTurn,
          status: status,
        });
      } else {
        this.setState({
          squares: currentSquares,
          turn: nextTurn,
          status: cellTypes[nextTurn] + " move",
        });
      }
    }
  }

  judgeWinner(currentSquares) {
    let winner = 0;
    let blackCount = 0
    let whiteCount = 0;
    currentSquares.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) {
          blackCount++;
        } else {
          whiteCount++
        }
      });
    });
    if (blackCount > whiteCount) {
      winner = 1;
    } else if (blackCount < whiteCount) {
      winner = 2;
    }
    return {"winner": winner, "blackCount": blackCount, "whiteCount": whiteCount};
  }

  turnChange(currentSquares, currentTurn) {
    let nextTurn = 3 - currentTurn;

    // 手番変更
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.checkPutable(x, y, nextTurn, currentSquares).length > 0) {
          return nextTurn;
        }
      }
    }

    // パス（手番を再度変更し、置ける場所があるかチェックする）
    nextTurn = currentTurn;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.checkPutable(x, y, nextTurn, currentSquares).length > 0) {
          return nextTurn;
        }
      }
    }

    // ゲーム終了（両者ともにおける場所がない）
    return 0;
  }

  executeFlip(flipables, squares, currentTurn) {
    flipables.forEach(([x, y]) => {
      squares[y][x] = currentTurn;
    });
  }

  checkPutable(x, y, currentTurn, squares) {
    let flipables = [];
    if (squares[y][x] !== 0) {
      return flipables;
    }
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;

        let nx = x + dx;
        let ny = y + dy;
        const tempFlipables = [];

        while (squares[ny] && squares[ny][nx] === (3 - currentTurn)) {
          tempFlipables.push([nx, ny]);
          nx += dx;
          ny += dy;
        }
        if (squares[ny] && squares[ny][nx] === currentTurn) {
          flipables = flipables.concat(tempFlipables);
        }
      }
    }
    return flipables;
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={this.state.squares} turn={this.state.turn} onClick={(x, y) => this.handleClick(x, y)} />
        </div>
        <div className="game-info">
          <div>{this.state.status}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
