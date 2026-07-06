import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from 'react';
import { client, loginUser } from '../../service.js';
import AuthContext from '../Context/AuthContext.jsx';
import { jwtDecode } from 'jwt-decode';





function LoginPage() {

   

    const { setIsLogged } = useContext(AuthContext);
    const { setRole } = useContext(AuthContext);



    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.id]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(loginData);
            console.log(response.data.token);
            localStorage.setItem('token', response.data.token);
            const decodedToken = jwtDecode(response.data.token);

            setIsLogged(true);
            setRole(decodedToken.roles)
            
            client.defaults.headers['Authorization'] = "Bearer " + response.data.token;

            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <div className="login-page">

            <div className="Connexion">
                <form className="form" onSubmit={handleSubmit}>
                    <h2>Connexion</h2>

                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required onChange={handleChange} />

                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" id="password" name="password" required onChange={handleChange} />

                    <button type="submit">Se connecter</button>
                </form>

                <p className="inscription-link" onClick={() => navigate('/inscription')}>
                    Pas encore de compte? Inscrivez vous !
                </p>
            </div>



        </div>
    )
}

export default LoginPage;