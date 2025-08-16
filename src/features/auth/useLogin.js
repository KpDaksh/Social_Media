import {useState} from  'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";

const useLogin = ()=>{
    const [error, setError] = useState(null);  
    const [loading, setLoading] = useState(false);

    const login = async ({email, password}) => {
        setError(null);
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            return userCredential.user;
        }catch (err) {
            setLoading(false);
            setError(err.message);
            return null;
        }  
}
return {login, error, loading};
}
export default useLogin;