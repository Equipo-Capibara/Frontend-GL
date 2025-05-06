import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';

const homeStyle = {
  background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/resources/fondo_home.png)`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  height: '70vh',
};

function RegisterCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase(); // Convertir a mayúsculas
    if (/^[A-Z0-9]{0,6}$/.test(value)) {
      setCode(value);
      setError('');
    } else {
      setError('El código debe contener solo letras y números (máx. 6 caracteres).');
    }
  };

  const handleSubmit = async () => {
    if (code.length === 6) {
      try {
        const response = await fetch(`http://localhost:3000/api/room/${code}`);
        if (response.ok) {
          localStorage.setItem('roomCode', code);
          window.dispatchEvent(new Event('storage'));
          navigate(`/room/${code}`);
        } else {
          setError('El código de sala no es válido.');
        }
      } catch (error) {
        setError('Error al conectar con el servidor.');
      }
    } else {
      setError('El código debe tener exactamente 6 caracteres.');
    }
  };

  return (
    <div className="contain" style={homeStyle}>
      <div className="register">
        <p>¡Guardian, ingresa tu codigo de acceso de 6 cifras para continuar!</p>
        <input type="text" value={code} onChange={handleChange} placeholder="Ingresa tu codigo" maxLength="6" />
        <button onClick={handleSubmit}>Aceptar</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default RegisterCode;
