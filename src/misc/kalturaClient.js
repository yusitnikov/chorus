import {Client, Configuration, enums, services} from "kaltura-client";

export const createClientNoKs = (timeout) => {
    const configuration = new Configuration();
    configuration.serviceUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
    if (timeout) {
        configuration.timeout = timeout;
    }

    const client = new Client(configuration);
    client.shouldLog = false;
    client.setClientTag("chorus");

    return client;
};

export const executeKalturaRequest = (client, request) => new Promise((resolve, reject) => {
    request
        .completion((success, response) => (success ? resolve : reject)(response))
        .execute(client);
});

export const createKs = (admin) => executeKalturaRequest(createClientNoKs(), services.session.start(
    process.env.ADMIN_SECRET,
    "chorus",
    admin ? enums.SessionType.ADMIN : enums.SessionType.USER,
    process.env.NEXT_PUBLIC_PARTNER_ID,
    86400,
    admin ? "disableentitlement" : "editadmintags:*"
));

export const createClientWithKs = (ks, timeout) => {
    const client = createClientNoKs(timeout);
    client.setKs(ks);
    return client;
};
