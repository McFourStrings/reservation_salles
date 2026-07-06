import { useEffect, useState, useContext } from "react";
import { getMe, updateMe, deleteMe } from '../../service.js';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../Context/AuthContext.jsx';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [update, setUpdate] = useState(false);
    const navigate = useNavigate();
    const { isLogged } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: ''
    });

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

    useEffect(() => {
        fetchUser();
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

    const deleteAccount = async()=>{
        await deleteMe();
        localStorage.clear();
        navigate('/');
    }

    if (loading) {
        return <div className="loading">Chargement de votre profil...</div>;
    }

    if (!isLogged){
      return( <p className="login-prompt" onClick={() => navigate('/login')}>
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
                    <p className="delete-account" onClick={deleteAccount}>
                        Supprimer mon compte
                    </p>
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
        </div>
    );
};

export default Profil;