import { useState } from "react";
import Board from './Board';

const cellTypes = ["empty", "black", "white"];

const Game = () => {
    const initSquares = Array(8).fill(0).map(() => Array(8).fill(0));
    initSquares[3][3] = 1;
    initSquares[4][4] = 1;
    initSquares[3][4] = 2;
    initSquares[4][3] = 2;

    const [squares, setSquares] = useState(initSquares);
    const [turn, setTurn] = useState(1);
    const [status, setStatus] = useState(cellTypes[turn] + "'s turn");

    const handleClick = (x, y) => {
        const currentSquares = squares.slice();
        const currentTurn = turn;

        const flipables = checkPutable(x, y, currentTurn, currentSquares);

        if (flipables.length === 0) return;

        // executeFlip(flipables, currentSquares, currentTurn);
        flipables.forEach(([x, y]) => {
            currentSquares[y][x] = currentTurn;
        });
        currentSquares[y][x] = currentTurn;
        const nextTurn = turnChange(currentSquares, currentTurn);

        if (nextTurn === 0) {
            // Game End
            let status;
            const { winner, blackCount, whiteCount } = judgeWinner(currentSquares);
            if (winner === 0) {
                status = "draw (blackCount: " + blackCount + " whiteCount: " + whiteCount + ")";
            } else {
                status = cellTypes[winner] + " win (blackCount: " + blackCount + " whiteCount: " + whiteCount + ")";
            }
            setSquares(currentSquares);
            setTurn(nextTurn);
            setStatus(status);
        } else {
            setSquares(currentSquares);
            setTurn(nextTurn);
            setStatus(cellTypes[nextTurn] + "'s turn");
        }
    }

    const checkPutable = (x, y, currentTurn, currentSquares) => {
        let flipables = [];
        if (currentSquares[y][x] !== 0) {
            return flipables;
        }
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0) continue;

                let nx = x + dx;
                let ny = y + dy;
                const tempFlipables = [];

                while (currentSquares[ny] && currentSquares[ny][nx] === (3 - currentTurn)) {
                    tempFlipables.push([nx, ny]);
                    nx += dx;
                    ny += dy;
                }
                if (currentSquares[ny] && currentSquares[ny][nx] === currentTurn) {
                    flipables = flipables.concat(tempFlipables);
                }
            }
        }
        return flipables;
    }

    const executeFlip = (flipables, currentSquares, currentTurn) => {
        flipables.forEach(([x, y]) => {
            currentSquares[y][x] = currentTurn;
            console.log(currentSquares, y, currentSquares[y]);
        });
    }

    const judgeWinner = (currentSquares) => {
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
        return { "winner": winner, "blackCount": blackCount, "whiteCount": whiteCount };
    }

    const turnChange = (currentSquares, currentTurn) => {
        let nextTurn = 3 - currentTurn;

        // 手番変更
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (checkPutable(x, y, nextTurn, currentSquares).length > 0) {
                    return nextTurn;
                }
            }
        }

        // パス（手番を再度変更し、置ける場所があるかチェックする）
        nextTurn = currentTurn;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (checkPutable(x, y, nextTurn, currentSquares).length > 0) {
                    return nextTurn;
                }
            }
        }

        // ゲーム終了（両者ともにおける場所がない）
        return 0;
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board squares={squares} turn={turn} onClick={(x, y) => handleClick(x, y)} cellTypes={cellTypes} />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{/* TODO */}</ol>
            </div>
        </div>
    )
}

export default Game;