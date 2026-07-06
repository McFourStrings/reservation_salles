import AuthContext from "../Context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    getAllClients,
    deleteUser,
    getAllResa,
    updateSatutResa
} from "../../service";






const DashBoard = () => {
    const { isLogged, setIsLogged } = useContext(AuthContext);
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    const [gestionClients, setGestionClients] = useState(false);
    const [gestionSalles, setGestionSalles] = useState(false);
    const [gestionResa, setGestionResa] = useState(false);

    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([])

    const fetchUsers = async () => {
        try {
            const response = await getAllClients();

            setUsers(response.data);
        } catch (error) {
            console.error(error)
        }
    }

    const fetchResa = async () => {
        try {
            const response = await getAllResa();

            setReservations(response.data);
        } catch (error) {
            console.error(error)
        }
    }

    const delUser = async (id) => {
        try {
            await deleteUser(id);
            alert('Utilisateur supprimé');
            fetchUsers();

        } catch (error) {
            console.error(error)

        }
    }

    const handleStatusChange = async (id, newStatut) => {
        try {
            await updateSatutResa(id, { statut: newStatut });
            alert('Statut mis à jour avec succès');
            fetchResa();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchResa();
    }, []);


    const admin = Array.isArray(role)
        ? role.includes("ROLE_ADMIN")
        : role === "ROLE_ADMIN";

    if (!admin) {
        return (<p className="login-prompt" onClick={() => navigate('/login')}>
            Cette page est réservée aux administrateurs, veuillez vous connecter à un compte admin en cliquant ici.
        </p>)
    }
    return (
        <div className="dashboard">
            <h1>Que voulez vous faire?</h1>
            <ul className="admin-list">
                <li onClick={() => { setGestionClients(true), setGestionResa(false), setGestionSalles(false) }} className="adminChoices">Gestion des clients</li>
                <li onClick={() => { setGestionSalles(true), setGestionClients(false), setGestionResa(false) }} className="adminChoices">Gestion des salles</li>
                <li onClick={() => { setGestionResa(true), setGestionClients(false), setGestionSalles(false) }} className="adminChoices">Gestion des réservations</li>
            </ul>

            {gestionClients && (
                <div className="users-cards-grid">
                    {users.map((client) => (
                        <div key={client.id} className="user-card">
                            <h3>{client.prenom} {client.nom}</h3>
                            <p><strong>Email :</strong> {client.email}</p>
                            {client.role !== 'admin' && <button onClick={() => delUser(client.id)}>
                                Supprimer cet utilisateur
                            </button>}
                        </div>
                    ))}
                </div>
            )}

            {gestionResa && (
                <ul className="rooms-list">
                    {reservations.map((resa) => (
                        <li key={resa.id}>
                            Salle <strong>{resa.salle.nom}</strong> située à {resa.salle.localisation} réservée le {resa.date_creation} <br />
                            Événement prévu le {resa.date} de {resa.heure_debut} à {resa.heure_fin} <br />
                            Statut : {resa.statut} <br />
                            Réservée par : {`${resa.utilisateur.prenom} ${resa.utilisateur.nom}`} <br />
                            Contact : {resa.utilisateur.email} <br />
                            <div style={{ marginTop: '1rem' }}>
                                <label htmlFor={`status-${resa.id}`} style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>Modifier le statut : </label>
                                <select
                                    id={`status-${resa.id}`}
                                    value={resa.statut}
                                    onChange={(e) => handleStatusChange(resa.id, e.target.value)}
                                    style={{ padding: '0.3rem', borderRadius: '4px', backgroundColor: '#222', color: '#fff', border: '1px solid #44' }}
                                >
                                    <option value="stand_by">Stand-by</option>
                                    <option value="confirme">Confirmé</option>
                                    <option value="annule">Annulé</option>
                                </select>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    )
};

export default DashBoard;