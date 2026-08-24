import httpService from "./httpClient";

class CurrencyService {
    async getCurrencies() {
        const response =  await httpService.get('/currencies');
        return response.data;
    }
}

export default new CurrencyService();