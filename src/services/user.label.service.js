import httpService from "./httpClient";

class UserLabelService {
    async getUserLabels() {
        return await httpService.get('/UserLabels');
    }

    async getUserLabel(id) {
        return await httpService.get(`/UserLabels/${id}`);
    }

    async createUserLabel(data) {
        return await httpService.post('/UserLabels', data);
    }

    async updateUserLabel(data) {
        return await httpService.put('/UserLabels', data);
    }

    async deleteUserLabel(id) {
        return await httpService.delete(`/UserLabels/${id}`);
    }
}

export default new UserLabelService();
