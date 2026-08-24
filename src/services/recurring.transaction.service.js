import httpService from "./httpClient";

class RecurringTransactionService {
    async getAllRecurringTransactions(queryParams = {}) {
        const response = await httpService.get('/recurringtransactions', { params: queryParams });
        return response;
    }

    async getRecurringTransactionById(id) {
        const response = await httpService.get(`/recurringtransactions/${id}`);
        return response;
    }

    async createRecurringTransaction(data) {
        const response = await httpService.post('/recurringtransactions', data);
        return response;
    }

    async updateRecurringTransaction(id, data) {
        const response = await httpService.put(`/recurringtransactions/${id}`, data);
        return response;
    }

    async deleteRecurringTransaction(id) {
        const response = await httpService.delete(`/recurringtransactions/${id}`);
        return response;
    }
}

export default new RecurringTransactionService();
