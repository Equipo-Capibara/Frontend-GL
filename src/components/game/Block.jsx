import React from 'react';
import '../../styles/tile.css';

const Block = ({ type }) => {
  return <img src={`/resources/${type.toLowerCase()}.png`} alt={type} className="tile-content" />;
};

export default Block;
