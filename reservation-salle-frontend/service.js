import axios from "axios";
import { jwtDecode } from "jwt-decode";


export const client = axios.create({
    baseURL: "http://localhost:8000/api"
});

export function registerUser(data) {
  
        return client.post('/utilisateur/inscription', data)
  
}

export function loginUser(data) {
    return client.post('/login', data);
}

export function isConnected() {
    const token = localStorage.getItem("token")

    if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
            client.defaults.headers['Authorization'] = "Bearer " + token;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

}

export function getMe(){
    return client.get('/utilisateur/me');
}

export function updateMe(data){
    return client.put('/utilisateur/me/update',data);
}

export function deleteMe(){
    return client.delete('/utilisateur/me/delete');
}

export function getRole() {

    if (isConnected()) {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        return decodedToken.roles;

    } else {
        return "";
    }
}


export default function getAllRooms(){
    return client.get('/salle/getAllRooms');
}

export function getRoomById(id){
    return client.get(`/salle/get_one/${id}`);
}


export function getMyReservations(){
    return client.get('/reservations/my-reservations');
}

export function createResa(data){
    return client.post('/reservations/create', data);
}

export function updateResa(id, data) {
    return client.put(`/reservations/update/${id}`, data);
}