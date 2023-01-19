import fetch from 'node-fetch'

export const handler = async (event, context, callback) => {
    // your server-side functionality
    var fulltext, genType, modelInputs, output;
    fulltext = event.queryStringParameters["fulltext"];
    genType = event.queryStringParameters["gen_type"];
    modelInputs = {
        "temperature": 1.0,
        "top_p": 0.7,
        "num_beams": 1,
        "do_sample": true
    };

    if (genType === "headline") {
        modelInputs["prompt"] = `[Text]:${fulltext}\n\n[Titel]:`;
        modelInputs["max_new_tokens"] = 60;
    } else if (genType === "teaser") {
        modelInputs["prompt"] = `[Text]:${fulltext}\n\n[Teaser]:`;
        modelInputs["max_new_tokens"] = 150;

    }

    // run banana api call to queue task
    const model_response = await fetch("https://api.banana.dev/start/v4",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                "apiKey": process.env.BANANA_API_KEY, // **required -** your api key, for authorization
                "modelKey": process.env.BANANA_MODEL_KEY, // **required -** the key giving you access to this model
                "modelInputs": modelInputs, // **required -** the json passed to the model inference server
                "startOnly": true, // **optional -** boolean flag to tell backend to return a callID immediately, without awaiting results. Defaults to false.
            })
        });
    out = await model_response.json();    

    // Send response
    response = {
        statusCode: 200,
        body: JSON.stringify({
            "finished": false,
            "callID": out.callID
        }),
    };
    return response
};