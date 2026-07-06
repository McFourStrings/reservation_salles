import React from 'react';


const AuthContext = React.createContext({
    isLogged: false,
    setIsLogged: () => {},
    role:"",
    setRole: () => {}
    
});

export default AuthContext;