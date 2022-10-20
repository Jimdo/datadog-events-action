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
    const bodyText = `
        %%% \n CI Deployment started 
        PR: [#${pr.number}](${pr.html_url}) 
        Head: ${pr.head.ref} 
        Author: ${pr.assignee.html_url} 
        Repo: ${repo.html_url} \n %%%
    `;
    const params: v1.EventsApiCreateEventRequest = {
        body: {
            title: `CI: ${repo.full_name} deployment started`,
            text: bodyText,
            tags: [`repo:${repo.full_name}`, 'event:ci.deployment.started', 'source:github-ci'],
            alertType: 'info',
        },
    };

    apiInstance
        .createEvent(params)
        .then((data: v1.EventCreateResponse) => {
            info(`Event created! at ${data.event.url}`);
        })
        .catch((error: any) => console.error(error));
} catch (error) {
    setFailed(error.message);
}
