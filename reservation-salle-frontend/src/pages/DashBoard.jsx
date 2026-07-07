import AuthContext from "../Context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    getAllClients,
    deleteUser,
    getAllResa,
    updateSatutResa,
    addRoom,
    updateRoom,
    softDelRoom,
    getAllRoomsAdmin,
    restoreRoom
} from "../../service";






const DashBoard = () => {
    const { isLogged, setIsLogged } = useContext(AuthContext);
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    const [gestionClients, setGestionClients] = useState(false);
    const [gestionSalles, setGestionSalles] = useState(false);
    const [gestionResa, setGestionResa] = useState(false);

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await getAllClients();

            setUsers(response.data);
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




    const [reservations, setReservations] = useState([]);

    const [showAllResa, setShowAllResa] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showStandBy, setShowStandBy] = useState(false);
    const [showAnnule, setShowAnnule] = useState(false);

    const confirm = reservations.filter(resa => resa.statut === 'confirme');
    const standby = reservations.filter(resa => resa.statut === 'stand_by');
    const annule = reservations.filter(resa => resa.statut === 'annule');

    const fetchResa = async () => {
        try {
            const response = await getAllResa();

            setReservations(response.data);
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


    const [salles, setSalles] = useState([]);
    const [showDeletedRooms, setShowDeletedRooms] = useState(false);
    const [showRoomsDispo, setShowRoomsDispo] = useState(false);
    const [newRoom, setNewRoom] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState(null);

    const fetchRooms = async () => {
        try {
            const response = await getAllRoomsAdmin();
            setSalles(response.data);
        } catch (error) {
            console.error(error)
        }
    };

    const sallesDispo = salles.filter(salle => salle.disponibilité == true);
    const salleSuppr = salles.filter(salle => salle.disponibilité == false);


    const handleRestoreRoom = async (id) => {
        try {
            await restoreRoom(id);
            alert('Salle de nouveau disponible à la réservation');
            fetchRooms();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la restoration de la salle");
        }
    }

    const handleDeleteRoom = async (id) => {
        try {
            await softDelRoom(id);
            alert('Salle supprimée avec succès');
            fetchRooms();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression de la salle");
        }
    }

    const [formData, setFormData] = useState({
        nom: '',
        capacite: '',
        description: '',
        localisation: '',
        equipements: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await addRoom(formData)
            alert('Salle créée avec succès');
            setNewRoom(false);
            fetchRooms()
        } catch (error) {
            console.error(error);

        }
    }

    const startEditingRoom = (room) => {
        setEditingRoomId(room.id);
        setFormData({
            nom: room.nom || '',
            capacite: room.capacite || '',
            description: room.description || '',
            localisation: room.localisation || '',
            equipements: room.equipements || ''
        });
    }

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateRoom(editingRoomId, formData);
            alert('Salle mise à jour avec succès');
            setEditingRoomId(null);
            fetchRooms();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la modification de la salle");
        }
    }


    useEffect(() => {
        fetchUsers();
        fetchResa();
        fetchRooms();
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
                <li onClick={() => { setGestionClients(true), setGestionResa(false), setGestionSalles(false), setShowAllResa(false), setShowAnnule(false), setShowConfirm(false), setShowStandBy(false) }} className="adminChoices">Gestion des clients</li>
                <li onClick={() => { setGestionSalles(true), setGestionClients(false), setGestionResa(false),setShowAllResa(false), setShowAnnule(false), setShowConfirm(false), setShowStandBy(false) }} className="adminChoices">Gestion des salles</li>
                <li onClick={() => { setGestionResa(true), setGestionClients(false), setGestionSalles(false), setShowAllResa(false), setShowAnnule(false), setShowConfirm(false), setShowStandBy(false) }} className="adminChoices">Gestion des réservations</li>
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
                <>
                <br/>
                <h1>Gestion des réservations</h1>
 <ul className="admin-list">
                            <li className="adminChoices" onClick={() => { setShowAllResa(true), setShowAnnule(false), setShowConfirm(false), setShowStandBy(false) }}>Afficher tout</li>
                            <li className="adminChoices" onClick={() => { setShowAllResa(false), setShowAnnule(false), setShowConfirm(true), setShowStandBy(false) }}>Réservations confirmées</li>
                            <li className="adminChoices" onClick={() => { setShowAllResa(false), setShowAnnule(false), setShowConfirm(false), setShowStandBy(true) }}>Réservations en attente</li>
                            <li className="adminChoices" onClick={() => { setShowAllResa(false), setShowAnnule(true), setShowConfirm(false), setShowStandBy(false) }}>Réservation annulées</li>
                        </ul>
                        

              {showAllResa && (  <ul className="rooms-list">
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
                </ul>)}
                {showAnnule && <ul className="rooms-list">
                    {annule.map((resa) => (
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
                </ul>}
                  {showConfirm && <ul className="rooms-list">
                    {confirm.map((resa) => (
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
                </ul>}
                  {showStandBy && <ul className="rooms-list">
                    {standby.map((resa) => (
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
                </ul>}
                </>
            )}

            {gestionSalles && (
                <>
                    <br />
                    <h1>Gestion des Salles</h1>
                    <ul className="admin-list">
                        <li onClick={() => { setShowRoomsDispo(false), setShowDeletedRooms(false), setNewRoom(true) }} className="adminChoices">Ajouter une nouvelle salle</li>
                        <li onClick={() => { setShowRoomsDispo(true), setShowDeletedRooms(false), setNewRoom(false) }} className="adminChoices">Editer ou supprimer une salle existante</li>
                        <li onClick={() => { setShowRoomsDispo(false), setShowDeletedRooms(true), setNewRoom(false) }} className="adminChoices">Restaurer une salle supprimée</li>

                    </ul>

                    {showRoomsDispo &&
                        <ul className="rooms-list">
                            {sallesDispo.map((room) => (
                                <li key={room.id}>
                                    {editingRoomId === room.id ? (
                                        /* 💡 Le formulaire d'édition s'affiche à la place de la ligne si on clique sur Modifier */
                                        <form onSubmit={handleSubmitUpdate} className="form-create-room" style={{ margin: '1rem 0', maxWidth: '100%' }}>
                                            <h3>Modifier la salle : {room.nom}</h3>

                                            <label htmlFor="nom">Nom de la salle</label>
                                            <input type="text" id="nom" value={formData.nom} onChange={handleChange} required />

                                            <label htmlFor="capacite">Capacité</label>
                                            <input type="number" id="capacite" value={formData.capacite} onChange={handleChange} required min="1" />

                                            <label htmlFor="localisation">Localisation</label>
                                            <input type="text" id="localisation" value={formData.localisation} onChange={handleChange} required />

                                            <label htmlFor="equipements">Équipements</label>
                                            <input type="text" id="equipements" value={formData.equipements} onChange={handleChange}  />

                                            <label htmlFor="description">Description</label>
                                            <textarea id="description" value={formData.description} onChange={handleChange}  rows="4" style={{ resize: 'none' }} />

                                            <div className="form-actions" style={{ marginTop: '1rem' }}>
                                                <button type="submit">Sauvegarder</button>
                                                <button type="button" onClick={() => setEditingRoomId(null)} style={{ marginLeft: '0.5rem' }}>
                                                    Annuler
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            Salle <strong>{room.nom}</strong> située à {room.localisation}
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <button onClick={() => startEditingRoom(room)} style={{ marginRight: '0.5rem' }}>Modifier la salle</button>
                                                <button onClick={() => handleDeleteRoom(room.id)} style={{ color: 'red' }}>Supprimer la salle</button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    }

                    {showDeletedRooms &&
                        <ul className="rooms-list">
                            {salleSuppr.map((room) =>
                                <li key={room.id} >Salle {room.nom} située à {room.localisation}
                                    <button onClick={() => handleRestoreRoom(room.id)}>Restaurer la salle</button> </li>)}
                        </ul>
                    }
                    {newRoom &&
                        <form onSubmit={handleSubmit} className="form-create-room">
                            <h2>Créer une nouvelle salle</h2>

                            <label htmlFor="nom">Nom de la salle</label>
                            <input
                                type="text"
                                id="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="capacite">Capacité (personnes)</label>
                            <input
                                type="number"
                                id="capacite"
                                value={formData.capacite}
                                onChange={handleChange}
                                required
                                min="1"
                            />

                            <label htmlFor="localisation">Localisation / Adresse</label>
                            <input
                                type="text"
                                id="localisation"
                                value={formData.localisation}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="equipements">Équipements dispo</label>
                            <input
                                type="text"
                                id="equipements"
                                value={formData.equipements}
                                onChange={handleChange}
                            />

                            <label htmlFor="description">Description de la salle</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                style={{ resize: 'none' }}
                            />

                            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                                <button type="submit">Créer la salle</button>
                                <button
                                    type="button"
                                    onClick={() => setNewRoom(false)}
                                    style={{ marginLeft: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    }


                </>
            )}

        </div>
    )
};

export default DashBoard;