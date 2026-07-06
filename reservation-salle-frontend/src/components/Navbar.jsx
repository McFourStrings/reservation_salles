import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { isLogged, setIsLogged } = useContext(AuthContext);
    const { role } = useContext(AuthContext);

   const admin = Array.isArray(role) 
        ? role.includes("ROLE_ADMIN") 
        : role === "ROLE_ADMIN";

    const logout = () => {
   setIsLogged(false);
    localStorage.clear();
    
};


    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Take-A-Room</Link>
            </div>

            <ul className="navbar-links">
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/rooms">Salles</Link></li>
                {isLogged && admin && (
                    <li><Link to="/admin" className="admin-link">Dashboard Admin</Link></li>
                )}
            </ul>

            <div className="navbar-auth">
                {isLogged ? (
                    <div className="user-profile-menu">
                        <span className="welcome-text" onClick={() => navigate('/me')}>
                            👋 {'Mon Profil'}
                        </span>
                        <button className="btn-logout" onClick={handleLogout}>
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Connexion
                        </button>
                        <button className="btn-register" onClick={() => navigate('/inscription')}>
                            S'inscrire
                        </button>
                    </div>
                )}


            </div>
        </nav>
    );
};

export default Navbar;