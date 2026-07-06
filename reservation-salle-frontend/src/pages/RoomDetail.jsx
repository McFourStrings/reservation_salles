import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById } from '../../service.js';
import AuthContext from '../Context/AuthContext.jsx';


const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isLogged } = useContext(AuthContext);

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                setLoading(true);
                const response = await getRoomById(id);
                setRoom(response.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Une erreur est survenue lors de la récupération de la salle.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRoomData();
        }
    }, [id]);

    if (loading) {
        return <div className="loading">Chargement des détails de la salle...</div>;
    }

    if (error) {
        return (
            <div className="error-page">
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={() => navigate('/rooms')}>Retour à la liste des salles</button>
            </div>
        );
    }

    return (
        <div className="room-detail-page">
            <button onClick={() => navigate(-1)}>⬅️ Retour</button>

            {room && (
                <div className="room-card">
                    <h1>Salle : {room.nom}</h1>
                    <p><strong>Localisation :</strong> {room.localisation}</p>
                    <p><strong>Capacité maximale :</strong> {room.capacite} personnes</p>

                    {room.description && (
                        <p><strong>Description :</strong> {room.description}</p>
                    )}

                    {room.equipements && (
                        <div className="equipements-section">
                            <h3>Équipements disponibles :</h3>
                            <p>{room.equipements}</p>
                        </div>
                    )}
                    {!isLogged ? (
                        <p className="login-prompt" onClick={() => navigate('/login')}>
                            Pour réserver une salle, veuillez vous connecter en cliquant ici
                        </p>
                    ) : ( 
                    <button className="btn-reserve" onClick={() => alert('Bientôt disponible !')}>
                        Réserver cette salle
                    </button> )}

                </div>
            )}
        </div>
    );
};

export default RoomDetail;