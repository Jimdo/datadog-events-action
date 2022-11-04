A Github action for sending CI deployment events to Datadog.

The intention was for this to enable us to show deployments in our Datadog dashboards, and easily correlate any metric changes with a deployment that caused it.

## How to use

### Environment Variables

First You need to add a Datadog API_KEY to your repository secrets. This will be then used by the action to send events to Datadog. Additionally you need to provide the Datadog Site. Usually this is "datadoghq.eu"

### Inputs

The action requires that an event name is passed. Currently supported event names are "start", "success" and "failure"

### Example

```yml
uses: Jimdo/datadog-events-action@main
env:
    DD_API_KEY: ${{ secrets.DD_API_KEY }}
    DD_SITE: datadoghq.eu
with:
    event: success
```

This triggers a call to Datadog Events API. You can see a link for the event in Datadog Events dashboard printed as a log message when you consult the Github job log. It takes a couple of seconds for it to be viewable.

<img width="583" alt="image" src="https://user-images.githubusercontent.com/45166849/199921939-b89dae84-1a9b-4f5c-b612-b51745736f51.png">
