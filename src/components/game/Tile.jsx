import React from 'react';
import Block from './Block';
import Character from './Character';
import Key from './Key';
import Door from './Door';
import '../../styles/gameBoard.css';

const Tile = ({ cell, tileSize, playerPos }) => {
  const style = {
    width: `${tileSize}px`,
    height: `${tileSize}px`,
    backgroundImage: `url('/resources/floor.png')`,
  };

  const isPlayerHere =
    cell.character && playerPos && cell.character.x === playerPos.x && cell.character.y === playerPos.y;

  return (
    <div className="tile" style={style}>
      {cell.block && <Block type={cell.block.type} />}
      {cell.character && !isPlayerHere && <Character element={cell.character.element} />}
      {cell.key && <Key />}
      {cell.door && <Door locked={cell.door.locked} />}
    </div>
  );
};

export default Tile;
