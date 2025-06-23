import { DataProvider, fetchUtils } from 'react-admin';

const httpClient = fetchUtils.fetchJson;

export const dataProvider: DataProvider = {
    getList: (resource, params) => {
        const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
        const { field, order } = params.sort || { field: 'id', order: 'ASC' };

        // Convert filter object to URL search params
        const searchParams = new URLSearchParams();

        // Add pagination parameters
        searchParams.set('_page', page.toString());
        searchParams.set('_limit', perPage.toString());

        // Add sorting parameters
        if (field) {
            searchParams.set('_sort', field);
            searchParams.set('_order', order);
        }

        // Add filter parameters directly
        Object.keys(params.filter).forEach(key => {
            const value = params.filter[key];
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, value.toString());
            }
        });

        const url = `/api/${resource}?${searchParams.toString()}`;

        return httpClient(url).then(({ headers, json }) => {
            // For pagination to work properly, we need to return the total count
            // The API should return this in headers or in the response
            const total = headers.get('x-total-count') ||
                (json.total !== undefined ? json.total :
                    (Array.isArray(json) ? json.length : 0));

            return {
                data: Array.isArray(json) ? json : json.data || [],
                total: parseInt(total.toString(), 10),
            };
        });
    },

    getOne: (resource, params) =>
        httpClient(`/api/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        })),

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `/api/${resource}?${new URLSearchParams(query).toString()}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
        const { field, order } = params.sort || { field: 'id', order: 'ASC' };
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `/api/${resource}?${new URLSearchParams(query).toString()}`;

        return httpClient(url).then(({ headers, json }) => ({
            data: json,
            total: Array.isArray(json) ? json.length : 0,
        }));
    },

    update: (resource, params) =>
        httpClient(`/api/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })),

    updateMany: (resource, params) => {
        return httpClient(`/api/${resource}/bulk-update`, {
            method: 'PUT',
            body: JSON.stringify({
                ids: params.ids,
                data: params.data
            }),
        }).then(({ json }) => ({ data: params.ids }));
    },

    create: (resource, params) =>
        httpClient(`/api/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json.id } as any,
        })),

    delete: (resource, params) =>
        httpClient(`/api/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json })),

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        return httpClient(`/api/${resource}?${new URLSearchParams(query).toString()}`, {
            method: 'DELETE',
        }).then(() => ({ data: params.ids }));
    },
};
