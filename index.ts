import { setFailed, info, getInput } from '@actions/core';
import { context } from '@actions/github';
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration({
    authMethods: { apiKeyAuth: process.env.DD_API_KEY },
});
const apiInstance = new v1.EventsApi(configuration);

const eventNames = ['start', 'success', 'failure'] as const;
type Events = typeof eventNames[number];
function isValidEvent(eventname: Events) {
    return eventNames.includes(eventname);
}

try {
    const eventname = getInput('event') as Events;
    if (!isValidEvent(eventname)) {
        throw new Error(
            `Invalid event input "${eventname}". Can be one of [${eventNames.join(', ')}]`
        );
    }

    const payload = context.payload;
    const pr = payload?.pull_request;
    const repo = payload?.repository;
    const title = `CI: "${repo.full_name}" deployment ${eventname}`;
    const tags = [`repo:${repo.full_name}`, `event:ci.deployment.${eventname}`, 'source:github-ci'];

    const isPullRequest = context.eventName === 'pull_request';
    const prBody = isPullRequest
        ? [`PR: [${pr?.title} (#${pr?.number})](${pr?.html_url})`, `Head: ${pr?.head.ref}`]
        : [];

    let textBody = [
        `CI Deployment ${eventname}`,
        `Repo: ${repo?.html_url}`,
        ...prBody,
        `Workflow: ${context.workflow}`,
        `Author: ${context.actor}`,
        `Event: ${context.eventName}`,
    ];

    const params: v1.EventsApiCreateEventRequest = {
        body: {
            title,
            text: `%%% ${textBody.join('\n')} %%%`,
            tags,
            alertType: 'info',
        },
    };

    apiInstance
        .createEvent(params)
        .then((data: v1.EventCreateResponse) => {
            info('Event body: ');
            info(JSON.stringify({ title, tags }, null, 2));
            info(textBody.join('\n'));
            info('\n');
            info(`Event created at ${data.event.url}`);
            info('It might take couple of seconds for the url to be active.');
        })
        .catch((error: any) => console.error(error));
} catch (error) {
    setFailed(error.message);
}
