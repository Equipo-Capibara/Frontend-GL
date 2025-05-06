import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './features/home/Home';
import Register from './features/auth/Register';
import { NavBar } from './components/ui';
import RoomScreen from './features/room/RoomScreen';
import RegisterCode from './features/auth/RegisterCode';
import { GameBoard } from './features/game';
import { WebSocketProvider } from './context/WebSocketContext';
import './styles/app.css';

const Layout = () => {
  const location = useLocation();

  // Mostrar NavBar solo en "/" y "/home"
  const showNavBar = location.pathname === '/' || location.pathname === '/home';

  return (
    <>
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/room/:roomCode" element={<RoomScreen />} />
        <Route path="/game/:roomCode" element={<GameBoard />} />
        <Route path="/join" element={<RegisterCode />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Layout />
      </Router>
    </WebSocketProvider>
  );
}

export default App;
