import httpService from './httpClient';

// Budgets API (/api/budgets). Unlike the other services this one unwraps the response envelope
// and throws a BudgetApiError, because budget errors need to be told apart (e.g. "already exists"
// comes back as 404 + "Record Already Exists").

export const ALREADY_EXISTS_MESSAGE = 'Record Already Exists';

export class BudgetApiError extends Error {
    constructor(status, messages, kind) {
        super(messages[0] || `HTTP ${status}`);
        this.name = 'BudgetApiError';
        this.status = status;
        this.messages = messages;
        this.kind = kind;
    }
}

/** 'validation' | 'unauthorized' | 'forbidden' | 'notFound' | 'alreadyExists' | 'server' | 'network' */
export function classifyError(status, messages = []) {
    if (!status) return 'network';
    if (status === 400) return 'validation';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    // 409 is forward compatible: the backend currently returns 404 for duplicates.
    if (status === 409 || messages.includes(ALREADY_EXISTS_MESSAGE)) return 'alreadyExists';
    if (status === 404) return 'notFound';
    return 'server';
}

/** Successful responses are camelCase, error responses PascalCase; reads both. */
export function normalizeEnvelope(raw) {
    return {
        data: raw?.data ?? raw?.Data,
        messages: raw?.messages ?? raw?.Messages ?? [],
        isSuccess: raw?.isSuccess ?? raw?.IsSuccess ?? false,
    };
}

function toApiError(error) {
    const res = error?.response;
    if (!res) return new BudgetApiError(0, [], 'network');
    const raw = res.data;
    // ProblemDetails (malformed JSON, wrong types) is not an envelope.
    const messages = raw?.errors
        ? Object.values(raw.errors).flat().map(String)
        : normalizeEnvelope(raw).messages;
    if (res.status === 400 && messages.length) console.warn('[budgets] validation:', messages);
    return new BudgetApiError(res.status, messages, classifyError(res.status, messages));
}

async function call(promise) {
    try {
        const response = await promise;
        return normalizeEnvelope(response.data).data;
    } catch (error) {
        throw toApiError(error);
    }
}

const budgetService = {
    list(currencyId) {
        return call(httpService.get('/budgets', { params: currencyId ? { currencyId } : {} }));
    },
    summary() {
        return call(httpService.get('/budgets/summary'));
    },
    get(id, historyCount = 6) {
        return call(httpService.get(`/budgets/${id}`, { params: { historyCount } }));
    },
    create(body) {
        return call(httpService.post('/budgets', body));
    },
    update(id, body) {
        return call(httpService.put(`/budgets/${id}`, body));
    },
    remove(id) {
        return call(httpService.delete(`/budgets/${id}`));
    },
};

export default budgetService;
