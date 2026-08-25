import httpService from "./httpClient";

class GoalService {
    async getAllGoals(queryParams = {}) {
        const response = await httpService.get('/goals', { params: queryParams });
        return response;
    }

    async getGoalMetrics(queryParams = {}) {
        const response = await httpService.get('/goals/metrics', { params: queryParams });
        return response;
    }

    async getGoalById(id) {
        const response = await httpService.get(`/goals/${id}`);
        return response;
    }

    async createGoal(data) {
        const response = await httpService.post('/goals', data);
        return response;
    }

    async updateGoal(id, data) {
        const response = await httpService.put(`/goals/${id}`, data);
        return response;
    }

    async deleteGoal(id) {
        const response = await httpService.delete(`/goals/${id}`);
        return response;
    }

    async contributeToGoal(id, data) {
        const response = await httpService.post(`/goals/${id}/contribute`, data);
        return response;
    }
}

export default new GoalService();
