import Square from './Square';

const Board = (props) => {
    const renderSquare = (x, y, value) => {
        return <Square key={x+","+y} top={y*64} left={x*64} value={value} onClick={() => props.onClick(x, y)} cellTypes={props.cellTypes} />;
    }

    const boardDom = [];
    for (let y = 0; y < props.squares.length; y++) {
        for (let x = 0; x < props.squares.length; x++) {
            boardDom.push(renderSquare(x, y, props.squares[y][x]));
        }
        
    }
    return (
        <div>
            {boardDom}
        </div>
    )
}

export default Board;