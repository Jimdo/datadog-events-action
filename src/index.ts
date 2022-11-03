import { setFailed, info, getInput } from '@actions/core';
import { context } from '@actions/github';
import { createEventBody, sendEvent } from './datadog.helper';
import { Events, isValidEvent, throwInvalidEventError } from './event.helper';

(async () => {
    try {
        const eventname = getInput('event') as Events;
        if (!isValidEvent(eventname)) throwInvalidEventError(eventname);

        const payload = context.payload;
        const pr = payload?.pull_request;
        const repo = payload?.repository;
        const title = `CI: "${repo.full_name}" deployment ${eventname}`;
        const tags = [
            `repo:${repo.full_name}`,
            `event:ci.deployment.${eventname}`,
            'source:github-ci',
        ];

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

        const params = createEventBody({
            title,
            text: `%%% ${textBody.join('\n')} %%%`,
            tags,
            alertType: 'info',
        });

        const eventResponse = await sendEvent(params);
        info('Event body: ');
        info(JSON.stringify({ title, tags }, null, 2));
        info(textBody.join('\n'));
        info('\n');
        info(`Event created at ${eventResponse.event.url}`);
        info('It might take couple of seconds for the url to be active.');
    } catch (error) {
        setFailed(error.message);
    }
})();
