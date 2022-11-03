const eventNames = ['start', 'success', 'failure'] as const;

export type Events = typeof eventNames[number];

export const isValidEvent = (eventname: Events) => {
    return eventNames.includes(eventname);
};

export const throwInvalidEventError = (eventname: string) => {
    throw new Error(`Invalid event input "${eventname}". Can be one of [${eventNames.join(', ')}]`);
};
