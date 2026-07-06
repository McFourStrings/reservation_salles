import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { isConnected, getRole } from '../service';
import AuthContext from './Context/AuthContext';
import Navbar from './components/Navbar';



import Login from './pages/Login';
import InscriptionPage from './pages/InscriptionPage';
import HomePage from './pages/HomePage';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Profil from './pages/Profil';


import './App.css'

function App() {

  const [isLogged, setIsLogged] = useState(isConnected());
  const [role, setRole] = useState(getRole());

  return (
    <AuthContext.Provider value={{ isLogged, setIsLogged, role, setRole }}>

      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/roomdetail/:id" element={<RoomDetail />} />
          <Route path="/me" element={<Profil />} />


        </Routes>

      </Router>
    </AuthContext.Provider>

  )
}

export default App
