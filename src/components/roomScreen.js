import { useState } from "react";
import CharacterCard from "./characterCard";
import fondo from "../resources/fondo_home.png";
import stone from "../resources/stone.png";
import brisa from "../resources/brisa.png";
import aqua from "../resources/aqua.png";
import flame from "../resources/flame.png";
import '../styles/roomScreen.css';

const characters = [
    { id: 1, name: "Flame", color: "#FFAD88", abilities: ["Crea y destruye bloques de fuego en línea recta.", "Lanza fuego a dos cuadros de distancia haciendo daño."], img: flame },
    { id: 2, name: "Aqua", color: "#A0D8F1", abilities: ["Crea y destruye bloques de agua en línea recta.", "Lluvia que aturde a tres cuadros de distancia."], img: aqua },
    { id: 3, name: "Brisa", color: "#DADADA", abilities: ["Crea y destruye bloques de aire en línea recta.", "Empuja a todos cinco cuadros de distancia."], img: brisa },
    { id: 4, name: "Stone", color: "#B4E197", abilities: ["Crea y destruye bloques de tierra en línea recta.", "Obtiene inmunidad a todo por 10 segundos."], img: stone }
];

const roomStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${fondo})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
};

export default function RoomScreen() {
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const [selectedCharacters, setSelectedCharacters] = useState([]);

    const nextCharacter = () => {
        setCurrentCharacterIndex((prev) => (prev + 1) % characters.length);
    };

    const prevCharacter = () => {
        setCurrentCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
    };

    return (
        <div className="room" style={roomStyle}>
            <div className="room-container">
                <h1>Sala #1234G</h1>
                <div className="character-grid">
                    <div className="character-selection">
                        <CharacterCard character={characters[currentCharacterIndex]} player="J1" />
                        <div className="navigation-buttons">
                            <button onClick={prevCharacter}>{"<"}</button>
                            <button onClick={nextCharacter}>{">"}</button>
                        </div>
                    </div>
                    {selectedCharacters.slice(1, 4).map((char, index) => (
                        <CharacterCard key={char.id} character={char} player={`J${index + 2}`} />
                    ))}
                </div>

                <div className="footer">
                    <button className="confirm-button">Confirmar elección</button>
                    <span className="player-count">Jugadores {selectedCharacters.length}/4</span>
                    <button className="start-button" disabled={selectedCharacters.length < 1}>Iniciar Partida</button>
                </div>
            </div>
        </div>
    );
}
