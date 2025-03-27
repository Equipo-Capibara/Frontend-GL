import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Home from './components/Home';
import Register from './components/Register';
import NavBar from "./components/NavBar";
import RoomScreen from "./components/roomScreen";
import './styles/app.css';

const Layout = () => {
    const location = useLocation();

    // Mostrar NavBar solo en "/" y "/home"
    const showNavBar = location.pathname === "/" || location.pathname === "/home";

    return (
        <>
            {showNavBar && <NavBar />}
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/room" element={<RoomScreen />} />
            </Routes>
        </>
    );
};


function App() {
  return (
      <Router>
          <Layout />
      </Router>

  );
}

export default App;
