import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import imgTitulo from "../resources/Titulo_juego_2.png";
import avatar from "../resources/avatar.png";
import '../styles/navbar.css';

const NavBar = () => {
    const location = useLocation();
    const [playerName, setPlayerName] = useState("");

    useEffect(() => {
        const updateName = () => {
            setPlayerName(localStorage.getItem("playerName") || "Invitado");
        };

        window.addEventListener("storage", updateName);
        updateName();

        return () => {
            window.removeEventListener("storage", updateName);
        };
    }, []);

    // Definir títulos dinámicos según la ruta
    const titles = {
        "/": "Registro Nombre",
        "/home": "Home",
        "/juego": "En el juego",
        "/opciones": "Opciones",
    };

    return (
        <div className="nav-top">
            <img src={imgTitulo} alt="Título del juego" />
            <p>{titles[location.pathname] || "Sección desconocida"}</p>

            {location.pathname === "/home" && (
                <div className="contain-user">
                    <p>{playerName || "Invitado"}</p>
                    <img src={avatar} alt="Avatar del jugador" />
                </div>
            )}
        </div>
    );
};

export default NavBar;
