import {Client, Configuration} from "kaltura-client";
import {ks} from "./externals";

export const kalturaConfiguration = new Configuration();
kalturaConfiguration.serviceUrl = process.env.REACT_APP_SERVICE_URL;
// server uses it for uploads, so set a very big timeout
kalturaConfiguration.timeout = 1800000;

export const kalturaClient = new Client(kalturaConfiguration);
kalturaClient.shouldLog = false;
kalturaClient.setClientTag("chorus");
kalturaClient.setKs(ks);

export const executeKalturaRequest = request => new Promise((resolve, reject) => {
    request
        .completion((success, response) => (success ? resolve : reject)(response))
        .execute(kalturaClient);
});
