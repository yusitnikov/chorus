// Don't try to parse the POST body automatically
export const apiConfig = {
    api: {
        bodyParser: false,
    },
};

export const parseApiJsonBody = async(request) => {
    if (request.method !== "POST") {
        throw "Request is not POST";
    }

    let dataStr = "";
    await new Promise(resolve => {
        request.on("data", chunk => dataStr += chunk);
        request.on("end", () => resolve());
    });

    if (!dataStr) {
        throw "Empty POST data";
    }

    try {
        return JSON.parse(dataStr);
    } catch (error) {
        throw "Failed to JSON parse the POST data";
    }
};
