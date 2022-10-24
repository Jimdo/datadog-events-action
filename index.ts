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

    const isPullRequest = context.eventName === 'pull_request';
    const prBody = !isPullRequest
        ? ''
        : `
        PR: [#${pr?.number} ${pr?.title}](${pr?.html_url})
        Head: ${pr?.head.ref}
    `;

    const text = `
        %%%
        CI Deployment started \n
        Repo: ${repo?.html_url} \n
        ${prBody} \n
        Workflow: ${context.workflow} \n
        Author: ${context.actor} \n
        Event: ${context.eventName}
        %%%
    `;

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
