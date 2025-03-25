import { Link } from 'react-router-dom';
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
    return (
        <div className="home" style={homeStyle}>
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