import React, { useEffect, useState, useRef } from "react";
import Tile from "./Tile";
import { getGameState, movePlayer, buildBlock  } from "../api/gameApi";
import "../styles/gameBoard.css";

const GameBoard = () => {
    const [board, setBoard] = useState(null);
    const [playerPos, setPlayerPos] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const boardRef = useRef();

    useEffect(() => {
        const fetchBoard = async () => {
            const data = await getGameState();
            setBoard(data);

            if (data.player) {
                setPlayerPos({ x: data.player.x, y: data.player.y });
            }
        };

        fetchBoard();
    }, []);

    useEffect(() => {
        const handleKeyDown = async (e) => {
            const key = e.key.toLowerCase();

            if (isMoving) return;

            if (["w", "a", "s", "d"].includes(key)) {
                setIsMoving(true);
                try {
                    const updatedBoard = await movePlayer(key);
                    setBoard(updatedBoard);

                    if (updatedBoard.player) {
                        setPlayerPos({ x: updatedBoard.player.x, y: updatedBoard.player.y });
                    }
                } catch (error) {
                    console.error("Error al mover el personaje:", error);
                } finally {
                    setTimeout(() => setIsMoving(false), 80);
                }
            } else if (key === "z") {
                try {
                    const updatedBoard = await buildBlock(); // llama al back para crear el bloque
                    setBoard(updatedBoard); // actualiza el tablero
                } catch (error) {
                    console.error("Error al construir el bloque:", error);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMoving]);

    if (!board || !playerPos) return <p>Cargando...</p>;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const tileWidth = screenWidth / board.width;
    const tileHeight = screenHeight / board.height;
    const tileSize = Math.floor(Math.min(tileWidth, tileHeight));

    const transposeGrid = (grid) => {
        const height = grid[0].length;
        const width = grid.length;
        const transposed = [];

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(grid[x][y]);
            }
            transposed.push(row);
        }

        return transposed;
    };

    const transposedGrid = transposeGrid(board.grid);

    return (
        <div className="game-wrapper">
            <div
                className="game-board"
                style={{
                    width: `${tileSize * board.width}px`,
                    height: `${tileSize * board.height}px`,
                }}
                ref={boardRef}
            >
                {transposedGrid.map((row, rowIndex) => (
                    <div className="board-row" key={rowIndex}>
                        {row.map((cell) => (
                            <Tile
                                key={`${cell.x}-${cell.y}`}
                                cell={cell}
                                tileSize={tileSize}
                                playerPos={playerPos}
                            />
                        ))}
                    </div>
                ))}
                <img
                    src="/resources/fire_character.png"
                    alt="Player"
                    className="player-sprite"
                    style={{
                        width: tileSize,
                        height: tileSize,
                        transform: `translate(${playerPos.x * tileSize}px, ${playerPos.y * tileSize}px)`,
                    }}
                />
            </div>
        </div>
    );
};

export default GameBoard;
