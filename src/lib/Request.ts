import axios from 'axios';

export default class Request {
    static async get(query: string) {
        try {
            const response = await axios.get('https://api.adultdatalink.com/pornpics/search', {
                params: {
                    query: query
                },
                headers: {
                    'accept': 'application/json'
                }
            });
            return response;
        } catch {
            return null;
        }
    }
}