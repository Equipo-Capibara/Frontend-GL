import React from "react";
import '../styles/tile.css';


const Character = ({ element }) => {
    return <img src={`resources/${element.toLowerCase()}_character.png`} alt={element} className="tile-content" />;
};

export default Character;
