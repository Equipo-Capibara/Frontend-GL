import { Link, useNavigate } from 'react-router-dom';
import { createRoom } from '../websocket';
import '../styles/home.css';

const homeStyle = {
  background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/resources/fondo_home.png)`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  height: 'calc(100vh - 120px)',
};

function Home() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const hostId = localStorage.getItem('playerId');
    console.log('id', localStorage.getItem('playerId'));
    if (!hostId) {
      console.error('No se ha encontrado un jugador válido');
      return;
    }

    createRoom(hostId, (room) => {
      if (room && room.code) {
        navigate(`/room/${room.code}`);
      } else {
        console.error('Error al crear la sala o roomId no encontrado');
      }
    });
  };

  return (
    <div className="home" style={homeStyle}>
      <nav>
        <button onClick={handleCreateRoom}>Iniciar Partida</button>
        <Link to="/join">Unirse a Sala</Link>
        <Link to="/game">Opciones</Link>
        <Link to="/notes">Notas de la Versión</Link>
        <Link to="/characters">Personajes</Link>
      </nav>
    </div>
  );
}

export default Home;
