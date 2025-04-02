import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoHome from "../resources/fondo_home.png";
import '../styles/register.css';

const homeStyle = {
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${fondoHome})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    height: "70vh"
};

function RegisterCode() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,6}$/.test(value)) {
            setCode(value);
            setError('');
        } else {
            setError('El codigo debe ser un número de 6 cifras.');
        }
    };

    const handleSubmit = () => {
        if (code.length === 6) {
            localStorage.setItem('roomCode', code);
            window.dispatchEvent(new Event("storage"));
            navigate('/home');
        } else {
            setError('El codigo debe tener exactamente 6 cifras.');
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