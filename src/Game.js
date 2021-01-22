import { useState } from "react";
import Board from './Board';

const cellTypes = ["empty", "black", "white", "puttable"];

const Game = () => {
    const initTurn = 1;
    const initSquares = Array(8).fill(0).map(() => Array(8).fill(0));
    initSquares[3][3] = 1;
    initSquares[4][4] = 1;
    initSquares[3][4] = 2;
    initSquares[4][3] = 2;

    const [squares, setSquares] = useState(initSquares);
    const [turn, setTurn] = useState(initTurn);
    const [status, setStatus] = useState("あなたの番です。");

    const handleClick = (x, y) => {
        const currentSquares = squares.slice();

        const flipables = checkPutable(x, y, turn, currentSquares);
        if (flipables.length === 0) return;

        executeFlip(flipables, currentSquares, turn);
        currentSquares[y][x] = turn;

        let nextTurn = turnChange(currentSquares, turn);
        while (nextTurn === 2) {
            // Computer turn
            const puttable = calcPuttable(currentSquares, nextTurn);
            const nextPut = puttable[0];
            executeFlip(nextPut.flipables, currentSquares, nextTurn);
            currentSquares[nextPut.y][nextPut.x] = nextTurn;
            nextTurn = turnChange(currentSquares, nextTurn);
        }

        highlightPuttable(currentSquares, nextTurn);
        let nextStatus = "あなたの番です。";
        if (nextTurn === 0) {
            // Game End
            const { winner, blackCount, whiteCount } = judgeWinner(currentSquares);
            if (winner === 0) {
                nextStatus = "引き分け (黒: " + blackCount + " 白: " + whiteCount + ")";
            } else if (winner === 1) {
                nextStatus = "あなたの勝ちです。 (黒: " + blackCount + " 白: " + whiteCount + ")";
            } else if (winner === 2) {
                nextStatus = "コンピュータの勝ちです。 (黒: " + blackCount + " 白: " + whiteCount + ")";
            }
            setStatus(nextStatus);
        }
        setSquares(currentSquares);
        setTurn(nextTurn);
        setStatus(nextStatus);
    }

    const checkPutable = (x, y, currentTurn, currentSquares) => {
        let flipables = [];
        if (currentSquares[y][x] === 1 || currentSquares[y][x] === 2) {
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
        });
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

    const highlightPuttable = (squares, turn) => {
        if (turn === 0) {
            return;
        }

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (squares[y][x] === 1 || squares[y][x] === 2) {
                    continue;
                }
                if (checkPutable(x, y, turn, squares).length > 0) {
                    squares[y][x] = 3;
                } else {
                    squares[y][x] = 0;
                }
            }
        }
    }

    const judgeWinner = (currentSquares) => {
        let winner = 0;
        let blackCount = 0
        let whiteCount = 0;
        currentSquares.forEach((row) => {
            row.forEach((cell) => {
                if (cell === 1) {
                    blackCount++;
                } else if (cell === 2) {
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

    const calcPuttable = (squares, turn) => {
        const ret = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (squares[y][x] === 1 || squares[y][x] === 2) {
                    continue;
                }
                const flipables = checkPutable(x, y, turn, squares);
                if (flipables.length > 0) {
                    ret.push({"x": x, "y": y, "flipables": flipables});
                }
            }
        }
        ret.sort((i, j) => {
            if (i.flipables.length > j.flipables.length) {
                return -1;
            } else if (i.flipables.length < j.flipables.length) {
                return 1;
            }
            return 0;
        });
        return ret;
    }

    const retry = () => {
        setSquares(initSquares);
        setTurn(initTurn);
        setStatus("あなたの番です。");
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board squares={squares} turn={turn} onClick={(x, y) => handleClick(x, y)} cellTypes={cellTypes} />
            </div>
            <div className="game-info">
                <div className="status">{status}</div>
                <br/>
                {turn === 0 && <button onClick={() => retry()}>もう一度</button>}
            </div>
        </div>
    )
}

export default Game;