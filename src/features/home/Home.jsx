import { Link, useNavigate } from 'react-router-dom';
import { roomsService, playersService } from '../../services';
import '../../styles/home.css';

const homeStyle = {
  background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/resources/fondo_home.png)`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  height: 'calc(100vh - 120px)',
};

function Home() {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    // Obtenemos el ID del jugador desde el servicio
    const hostId = playersService.getCurrentPlayerId();

    if (!hostId) {
      console.error('No se ha encontrado un jugador válido');
      return;
    }

    try {
      // Usamos el servicio de salas para crear una nueva sala
      const room = await roomsService.createRoom(hostId);

      if (room && room.code) {
        navigate(`/room/${room.code}`);
      } else {
        console.error('Error al crear la sala o roomId no encontrado');
      }
    } catch (error) {
      console.error('Error al crear la sala:', error);
    }
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
