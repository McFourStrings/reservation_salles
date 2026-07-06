import {useState, useEffect} from 'react';
import getAllRooms from '../../service.js';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {

    const navigate = useNavigate();
    const [rooms, setRooms]= useState([]);

   const fetchRooms = async () => {
        try {
            const response = await getAllRooms();
            setRooms(response.data);
           

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRooms();
    }, [])

    return (
        <div className="rooms-page">
            Quelle salle souhaitez-vous réserver ?
            <ul className="rooms-list">
                {rooms.map((room)=>
                <li key={room.id} onClick={() =>  navigate(`/roomdetail/${room.id}`)}>Salle {room.nom} située à {room.localisation} </li>)}
            </ul>
        </div>
      );
}
 
export default Rooms;