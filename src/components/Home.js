import { Link, useNavigate } from 'react-router-dom';
import { createRoom } from "../websocket";
import fondoHome from "../resources/fondo_home.png";
import '../styles/home.css';

const homeStyle = {
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${fondoHome})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    height: "calc(100vh - 120px)"
};

function Home() {
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        const hostId = localStorage.getItem("playerName");
        if (!hostId) {
            console.error("No se ha encontrado un jugador válido");
            return;
        }

        // Llamada a una función para crear la sala en el backend o WebSocket
        createRoom(hostId, (room) => {
            if (room && room.code) {
                navigate(`/room/${room.code}`); // Redirige a la sala creada usando el roomId
            } else {
                console.error("Error al crear la sala o roomId no encontrado");
            }
        });
    };

    return (
        <div className="home" style={homeStyle}>
            <nav>
                <button onClick={handleCreateRoom}>Iniciar Partida</button>
                <Link to="/join">Unirse a Sala</Link>
                <Link to="/options">Opciones</Link>
                <Link to="/notes">Notas de la Versión</Link>
                <Link to="/characters">Personajes</Link>
            </nav>
        </div>
    );
}

export default Home;