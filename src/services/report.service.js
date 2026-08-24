import httpService from "./httpClient";

class ReportService{
    async getCategorizedTransactionReport(params){
        return await httpService.get('/reports/transactions/categorized', { params });
    }

    async getNonCategorizedTransactionReport(params){
        return await httpService.get('/reports/transactions/noncategorized', { params });
    }

    async getPeriodSummary(params){
        return await httpService.get('/reports/period-summary', { params });
    }

    async getCategorySpending(params){
        return await httpService.get('/reports/category-spending', { params });
    }
}

export default new ReportService();