import React from "react";
import '../styles/tile.css';

const Door = ({ locked }) => {
    return (
        <img
            src={`/resources/${locked ? "door_locked" : "door_open"}.png`}
            alt="Door"
            className="tile-content"
        />
    );
};

export default Door;
