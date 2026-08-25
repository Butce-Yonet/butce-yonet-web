import httpService from "./httpClient";

class SubscriptionService {
    async getAllSubscriptions(queryParams = {}) {
        const response = await httpService.get('/subscriptions', { params: queryParams });
        return response;
    }

    async getSubscriptionById(id) {
        const response = await httpService.get(`/subscriptions/${id}`);
        return response;
    }

    async createSubscription(data) {
        const response = await httpService.post('/subscriptions', data);
        return response;
    }

    async updateSubscription(id, data) {
        const response = await httpService.put(`/subscriptions/${id}`, data);
        return response;
    }

    async deleteSubscription(id) {
        const response = await httpService.delete(`/subscriptions/${id}`);
        return response;
    }

    async markSubscriptionAsPaid(id, data) {
        const response = await httpService.post(`/subscriptions/${id}/pay`, data);
        return response;
    }
}

export default new SubscriptionService();
