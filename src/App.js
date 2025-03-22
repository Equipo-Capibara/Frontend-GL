import { BrowserRouter as Router, Route, Routes } from      'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import './styles/app.css';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
  );
}

export default App;

