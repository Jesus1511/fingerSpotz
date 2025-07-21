import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage'

export const url = "http://localhost:3000"//"http://192.168.1.4:3000"  // Cambiar a la IP de tu servidor

export const usePost = async (route, params) => {
    try {
        console.log(route, params)
        const token = await AsyncStorage.getItem("token");
        const actualParams = { ...params, token };
        const response = await axios.post(url + route, actualParams);

        if (response.data) {
            return response.data;
        }
    } catch (err) {
        if (err.response) {
            // Imprime el mensaje enviado por el servidor
            console.log("Error del servidor:", err.response.data);

            return {error: err.response.data.message}; // Devuelve el mensaje del backend
        } else {
            console.log("Error de red o desconocido:", err.message);
        }
        return null;
    }
};
