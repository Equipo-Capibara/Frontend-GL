import { Link } from 'react-router-dom';
import '../styles/home.css';

function Home() {
    return (
        <div className="home">
            <div>
                <div><img src="../resources/Titulo_juego_1.png" alt=""/></div>
                <div>Home</div>
                <div>Perfil</div>
            </div>
            <h1>Guardianes de la Luz</h1>
            <nav>
                <Link to="/register">Iniciar Partida</Link>
                <Link to="/join">Unirse a Sala</Link>
                <Link to="/options">Opciones</Link>
                <Link to="/notes">Notas de la Versión</Link>
                <Link to="/characters">Personajes</Link>
            </nav>
        </div>
    );
}

export default Home;