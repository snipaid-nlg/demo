import fetch from 'node-fetch'

const templates = {
    // snippet specific settings
    keywords: {
        task_prefix: "",
        prompt: "Nenne die zehn wichtigsten Keywords aus dem Text.",
        params: {
            min_new_tokens: 1,
            max_new_tokens: 80,
        }
    },
    headline: {
        task_prefix: "",
        prompt: "Welche Überschrift passt am besten zum Inhalt des Artikels?",
        params: {
            min_new_tokens: 3,
            max_new_tokens: 20,
        }
    },
    teaser: {
        task_prefix: "",
        prompt: "Generiere einen Teaser zu folgendem Artikel.",
        params: {
            min_new_tokens: 30,
            max_new_tokens: 60,
        }
    },
    summary: {
        task_prefix: "",
        prompt: "Fasse den folgenden Artikel in wenigen Sätzen zusammen für einen Newsletter.",
        params: {
            min_new_tokens: 50,
            max_new_tokens: 150,
        }
    },
    serp: {
        task_prefix: "",
        prompt: "Generiere eine SERP (Title-Tag und Meta-Description) für den folgenden Inhalt.",
        params: {
            min_new_tokens: 50,
            max_new_tokens: 90,
        }
    },
    tweet: {
        task_prefix: "",
        prompt: "Schreibe einen Tweet über den Artikel.",
        params: {
            min_new_tokens: 50,
            max_new_tokens: 150,
        }
    }
}

export const handler = async (event, context, callback) => {
    // server-side functionality
    var fulltext, genType, modelInputs, out;
    fulltext = event.queryStringParameters["fulltext"];
    genType = event.queryStringParameters["gen_type"];

    modelInputs = templates[genType];
    modelInputs["document"] = fulltext;

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
                "modelKey": process.env.BANANA_MODEL_KEY_IGEL, // **required -** the key giving you access to this model
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