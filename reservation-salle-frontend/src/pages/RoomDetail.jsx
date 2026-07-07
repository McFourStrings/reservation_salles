import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, createResa } from '../../service.js';
import AuthContext from '../Context/AuthContext.jsx';


const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isLogged } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);


    const [reservationData, setReservationData] = useState({
        date: '',
        heure_debut: '',
        heure_fin: '',
        salle_id: id
    });

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


    const handleResaChange = (e) => {
        setReservationData({
            ...reservationData,
            [e.target.id]: e.target.value
        });
    };

    const handleResaSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createResa(reservationData);
            alert(response.data.message); 
            
            setShowForm(false);
            setReservationData({ date: '', heure_debut: '', heure_fin: '', salle_id: id });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Impossible de réserver sur ce créneau.");
        }
    };

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
            <button className="btn-retour" onClick={() => navigate(-1)}> Retour</button>

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
                        !showForm ? (
                            <button className="btn-reserve" onClick={() => setShowForm(true)}>
                                Réserver cette salle
                            </button>
                        ) : (
                            <form onSubmit={handleResaSubmit}>
                                <h3>Choisir un créneau</h3>

                                <label htmlFor="date">Date</label>
                                <input type="date" id="date" required value={reservationData.date} onChange={handleResaChange} />

                                <label htmlFor="heure_debut">Heure de début</label>
                                <input type="time" id="heure_debut" required value={reservationData.heure_debut} onChange={handleResaChange} />

                                <label htmlFor="heure_fin">Heure de fin</label>
                                <input type="time" id="heure_fin" required value={reservationData.heure_fin} onChange={handleResaChange} />

                                <button type="submit">Confirmer la réservation</button>
                                <button type="button" onClick={() => setShowForm(false)}>Annuler</button>
                            </form>
                        )
                       
                    )}

                </div>
            )}
        </div>
    );
};

export default RoomDetail;