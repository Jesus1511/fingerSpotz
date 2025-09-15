import axios from 'axios'

export default async function getGeocoding(lat, long) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=AIzaSyDRAp7QZDTBKBxzY0ZpE4ksrGtuQ6fEjdU`)
    return response.data.results[0].formatted_address
}