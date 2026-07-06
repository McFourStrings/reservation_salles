import AuthContext from "../Context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';






const DashBoard = () => {
    const { isLogged, setIsLogged } = useContext(AuthContext);
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    const[gestionClients, setGestionClients]= useState(false);
    const [gestionSalles, setGestionSalles]=useState(false);
    const [gestionResa, setGestionResa]= useState(false);

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
            <li onClick={() => { setGestionClients(true) }} className="adminChoices">Gestion des clients</li>
            <li onClick={() => { setGestionSalles(true) }} className="adminChoices">Gestion des salles</li>
            <li onClick={() => { setGestionResa(true) }} className="adminChoices">Gestion des réservations</li>
        </ul>
        </div>

    );
}

export default DashBoard;