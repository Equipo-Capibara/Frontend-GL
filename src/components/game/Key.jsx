import React from 'react';
import '../../styles/tile.css';

const Key = ({ type }) => {
  return <img src={`/resources/${type.toLowerCase()}.png`} alt={type} className="tile-content-key" />;
};

export default Key;
