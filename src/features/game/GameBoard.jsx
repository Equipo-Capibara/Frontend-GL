import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Tile } from '../../components/game';
import { gameService, playersService } from '../../services';
import '../../styles/gameBoard.css';

const GameBoard = () => {
  const { roomCode } = useParams();
  const playerId = playersService.getCurrentPlayerId(); // Usa el servicio en lugar de localStorage

  const [board, setBoard] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const boardRef = useRef();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        // Usamos el servicio de juego para obtener el estado
        const data = await gameService.getGameState(roomCode);
        setBoard(data);
      } catch (error) {
        console.error('Error al obtener estado del juego:', error);
      }
    };

    fetchBoard();
  }, [roomCode]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      const key = e.key.toLowerCase();

      if (isMoving) return;

      if (['w', 'a', 's', 'd'].includes(key)) {
        setIsMoving(true);
        try {
          // Usamos el servicio de juego para mover al jugador
          const updatedBoard = await gameService.movePlayer(roomCode, playerId, key);
          setBoard(updatedBoard);
        } catch (error) {
          console.error('Error al mover el personaje:', error);
        } finally {
          setTimeout(() => setIsMoving(false), 80);
        }
      } else if (key === 'z') {
        try {
          // Usamos el servicio de juego para construir un bloque
          const updatedBoard = await gameService.buildBlock(roomCode, playerId);
          setBoard(updatedBoard);
        } catch (error) {
          console.error('Error al construir el bloque:', error);
        }
      } else if (key === 'x') {
        try {
          // Usamos el servicio de juego para destruir un bloque
          const updatedBoard = await gameService.destroyBlock(roomCode, playerId);
          setBoard(updatedBoard);
        } catch (error) {
          console.error('Error al destruir el bloque:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoving, roomCode, playerId]);

  if (!board || !board.characters) return <p>Cargando...</p>;

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

  const getSpriteForCharacter = (characterId) => {
    switch (characterId) {
      case '1':
        return '/resources/fire_character.png';
      case '2':
        return '/resources/water_character.png';
      case '3':
        return '/resources/wind_character.png';
      case '4':
        return '/resources/stone_character.png';
      default:
        return '/resources/fire_character.png';
    }
  };

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
              <Tile key={`${cell.x}-${cell.y}`} cell={cell} tileSize={tileSize} />
            ))}
          </div>
        ))}

        {board.characters.map((char) => (
          <img
            key={char.id}
            src={getSpriteForCharacter(char.character)}
            alt={`Character ${char.id}`}
            className="player-sprite"
            style={{
              width: tileSize,
              height: tileSize,
              transform: `translate(${char.x * tileSize}px, ${char.y * tileSize}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
