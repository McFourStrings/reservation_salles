import { useEffect, useState } from 'react';
import {registerUser} from '../../service.js';
import { useNavigate } from 'react-router-dom';








function InscriptionPage() {

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

    }, [])

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        nom: '',
        prenom:'',
        email: '',
        password:'',
      
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    }

     const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser(formData);

            navigate('/login');
        } catch (error) {
            console.error(error);

        }
    }

    return (
        <div className="inscription-page">
            <form  onSubmit={handleSubmit}className="form">

                <h2>Inscription</h2>

                <label htmlFor="nom">Nom*</label>
                <input type="text" id="nom" name="nom" required onChange={handleChange}/>

                <label htmlFor="prenom">Prénom*</label>
                <input type="text" id="prenom" name="prenom" required onChange={handleChange} />

                <label htmlFor="email">Email*</label>
                <input type="mail" id="email" name="email" required onChange={handleChange} />

                <label htmlFor="password">Mot de passe*</label>
                <input type="password" id="password" name="password" required onChange={handleChange} />


                <button type="submit">S'inscrire</button>

                <p className="FormInfo"> Les champs marqués d'un * sont obligatoires</p>

            </form>
        </div>
    )
}

export default InscriptionPage;