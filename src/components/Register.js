import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';

function Register() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9]{0,15}$/.test(value)) {
            setName(value);
            setError('');
        } else {
            setError('Solo letras y números, 3-15 caracteres.');
        }
    };

    const handleSubmit = () => {
        if (name.length >= 3 && name.length <= 15) {
            localStorage.setItem('playerName', name);
            navigate('/home');
        } else {
            setError('El nombre debe tener entre 3 y 15 caracteres.');
        }
    };

    return (
        <div className="register">
            <h2>Bienvenido a Guardianes de la Luz</h2>
            <input type="text" value={name} onChange={handleChange} placeholder="Ingresa tu nombre" />
            <button onClick={handleSubmit}>Aceptar</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default Register;