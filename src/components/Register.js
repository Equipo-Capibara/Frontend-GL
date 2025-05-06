import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/register.css';

const homeStyle = {
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/resources/fondo_home.png)`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    height: "70vh"
};

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

    const handleSubmit = async () => {
        if (name.length >= 3 && name.length <= 15) {
            try {
                // Usando fetch para crear el jugador en el backend
                const response = await fetch('http://localhost:8080/api/players?name=' + name, {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error('Hubo un problema al crear el jugador');
                }

                const player = await response.json();

                localStorage.setItem('playerId', player.id);
                localStorage.setItem('playerName', player.name);

                window.dispatchEvent(new Event("storage"));
                navigate('/home');
            } catch (error) {
                // Manejo de errores
                setError(error.message);
                console.error(error);
            }
        } else {
            setError('El nombre debe tener entre 3 y 15 caracteres.');
        }
    };

    return (
        <div className="contain" style={homeStyle}>
            <div className="register">
                <p>¡Hola, valiente Guardian! Antes de embarcarte en esta gran aventura, dime... ¿cuál es tu nombre?</p>
                <input type="text" value={name} onChange={handleChange} placeholder="Ingresa tu nombre" />
                <button onClick={handleSubmit}>Aceptar</button>
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

export default Register;
