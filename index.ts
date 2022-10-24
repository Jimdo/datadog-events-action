import { setFailed, info } from '@actions/core';
import { context } from '@actions/github';
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration({
    authMethods: { apiKeyAuth: process.env.DD_API_KEY },
});
const apiInstance = new v1.EventsApi(configuration);

try {
    const payload = context.payload;
    const pr = payload?.pull_request;
    const repo = payload?.repository;
    const title = `CI: "${repo.full_name}" deployment started`;
    const tags = [`repo:${repo.full_name}`, 'event:ci.deployment.started', 'source:github-ci'];
    const text = `
        %%% \n CI Deployment started
        PR: [#${pr?.number}](${pr?.html_url})
        Head: ${pr?.head.ref}
        Author: ${pr?.assignee?.html_url}
        Repo: ${repo?.html_url} \n %%%
    `;
    info(JSON.stringify(payload, null, 2));

    const params: v1.EventsApiCreateEventRequest = {
        body: {
            title,
            text,
            tags,
            alertType: 'info',
        },
    };

    apiInstance
        .createEvent(params)
        .then((data: v1.EventCreateResponse) => {
            info(JSON.stringify({ title, tags }, null, 2));
            info(`Event created! at ${data.event.url}`);
            info('It might take couple of seconds for the url to be active.');
        })
        .catch((error: any) => console.error(error));
} catch (error) {
    setFailed(error.message);
}
