import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration({
    authMethods: { apiKeyAuth: process.env.DD_API_KEY },
});

export const apiInstance = new v1.EventsApi(configuration);

export const createEventBody = (body: v1.EventCreateRequest): v1.EventsApiCreateEventRequest => ({
    body,
});

export const sendEvent = (eventBody: v1.EventsApiCreateEventRequest) =>
    apiInstance.createEvent(eventBody);
