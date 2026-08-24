import httpService from "./httpClient";

class TransactionService{
    async getAllTransactions(queryParams = {}){
        const response = await httpService.get('/transactions', { params: queryParams });
        return response;
    }

    async getTransaction(transactionId){
        const response = await httpService.get(`/transactions/${transactionId}`);
        return response;
    }

    async createTransaction(transactionData){
        const response = await httpService.post('/transactions', transactionData);
        return response;
    }

    async updateTransaction(transactionData){
        const response = await httpService.put('/transactions', transactionData);
        return response;
    }

    async deleteTransaction(transactionId){
        const response = await httpService.delete(`/transactions/${transactionId}`);
        return response;
    }
}

export default new TransactionService();
