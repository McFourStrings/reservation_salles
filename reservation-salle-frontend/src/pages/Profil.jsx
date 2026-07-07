import { useEffect, useState, useContext } from "react";
import { getMe, updateMe, deleteMe, getMyReservations, updateResa } from '../../service.js';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../Context/AuthContext.jsx';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [update, setUpdate] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [editingResaId, setEditingResaId] = useState(null);
    const { role } = useContext(AuthContext);

    const admin = Array.isArray(role)
        ? role.includes("ROLE_ADMIN")
        : role === "ROLE_ADMIN";

    const navigate = useNavigate();
    const { isLogged } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: ''
    });

    const [resaFormData, setResaFormData] = useState({
        date: '',
        heure_debut: '',
        heure_fin: ''
    });


    const startEditing = (resa) => {
        setEditingResaId(resa.id);

        const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';

        const [day, month, year] = resa.date.split('-');
        const formattedDate = `${year}-${month}-${day}`;

        setResaFormData({
            date: formattedDate,
            heure_debut: formatTime(resa.heure_debut),
            heure_fin: formatTime(resa.heure_fin)
        });
    };

    const handleResaFormChange = (e) => {
        setResaFormData({
            ...resaFormData,
            [e.target.id]: e.target.value
        });
    };

    const handleResaUpdateSubmit = async (e, id) => {
        e.preventDefault();
        try {
            await updateResa(id, resaFormData);
            alert("Réservation modifiée avec succès !");
            setEditingResaId(null);
            await fetchReservations();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Impossible de modifier la réservation.");
        }
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await getMe();
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await getMyReservations();
          

            setReservations(response.data);
        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    }

    useEffect(() => {
        fetchUser();
        fetchReservations();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMe(formData);
            await fetchUser();
            setUpdate(false);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteAccount = async () => {
        await deleteMe();
        localStorage.clear();
        navigate('/');
    }

    const handleCancel = async (id) => {

        try {
            await updateResa(id, { statut: 'annule' });
            alert("Réservation annulée avec succès.");
            await fetchReservations();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Impossible d'annuler cette réservation.");
        }
    };





    if (loading) {
        return <div className="loading">Chargement de votre profil...</div>;
    }

    if (!isLogged) {
        return (<p className="login-prompt" onClick={() => navigate('/login')}>
            Veuillez vous connecter pour accéder à votre profil.
        </p>)
    }

    return (
        <div className="profile-page">
            {!update ? (
                <>
                    <h2>Bonjour {user ? `${user.prenom} ${user.nom}` : "utilisateur"} !</h2>

                    <div className="profile-details">
                        <p><strong>Email :</strong> {user?.email}</p>
                        <p><strong>Inscrit le :</strong> {user?.date_creation}</p>
                    </div>

                    <p className="UpdateProfil" onClick={() => { setFormData(user); setUpdate(true); }}>
                        Mettre à jour vos informations
                    </p>
                    <br></br>
                    {!admin &&
                        <p className="delete-account" onClick={deleteAccount}>
                            Supprimer mon compte
                        </p>
                    }
                </>
            ) : (
                <form onSubmit={handleSubmit} className="form">
                    <h2>Mise à jour des informations</h2>

                    <label htmlFor="nom">Nom</label>
                    <input type="text" id="nom" name="nom" value={formData.nom || ''} required onChange={handleChange} />

                    <label htmlFor="prenom">Prénom</label>
                    <input type="text" id="prenom" name="prenom" value={formData.prenom || ''} required onChange={handleChange} />

                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email || ''} required onChange={handleChange} />

                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" id="password" name="password" value={formData.password || ''} required onChange={handleChange} />

                    <button type="submit">Mettre à jour</button>
                    <button type="button" className="btn-logout" style={{ marginTop: '1rem' }} onClick={() => setUpdate(false)}>
                        Annuler
                    </button>
                </form>
            )}

         <div className="list-reservation">
    <h1>Mes Réservations</h1>
    {reservations.length == 0 ? (
        <p>Vous n'avez aucune réservation</p>
    ) : (
        <ul className="rooms-list">
            {reservations.map((resa) => (
                <li key={resa.id}>
                    {resa.salle.disponibilité ===false ? (
                        <p>La salle {resa.salle.nom} est actuellement indisponible</p>
                    ) : (
                        editingResaId === resa.id ? (
                            <form onSubmit={(e) => handleResaUpdateSubmit(e, resa.id)}>
                                <h4>Modifier la réservation pour Salle {resa.salle.nom}</h4>

                                <label htmlFor="date">Date</label>
                                <input type="date" id="date" required value={resaFormData.date} onChange={handleResaFormChange} />

                                <label htmlFor="heure_debut">Début</label>
                                <input type="time" id="heure_debut" required value={resaFormData.heure_debut} onChange={handleResaFormChange} />

                                <label htmlFor="heure_fin">Fin</label>
                                <input type="time" id="heure_fin" required value={resaFormData.heure_fin} onChange={handleResaFormChange} />

                                <div style={{ marginTop: '1rem' }}>
                                    <button type="submit">Sauvegarder</button>
                                    <button type="button" onClick={() => setEditingResaId(null)} style={{ marginLeft: '0.5rem' }}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                Salle <strong>{resa.salle.nom}</strong> située à {resa.salle.localisation} réservée le {resa.date_creation} <br />
                                Événement prévu le {resa.date} de {resa.heure_debut} à {resa.heure_fin} <br />
                                Statut : {resa.statut}

                                {resa.statut === 'stand_by' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <button onClick={() => startEditing(resa)}>
                                            Mettre à jour
                                        </button>
                                        <button
                                            onClick={() => handleCancel(resa.id)}
                                            style={{ marginLeft: '0.5rem', color: 'red' }}
                                        >
                                            Annuler la réservation
                                        </button>
                                    </div>
                                )}
                            </>
                        )
                    )}
                </li>
            ))}
        </ul>
    )}
</div>
            </div>
        
    );
};

export default Profil;