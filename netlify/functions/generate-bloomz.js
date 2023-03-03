import fetch from 'node-fetch'

const templates = {
    // snippet specific settings
    keywords: {
        task_prefix: "",
        prompt: "\nKeywords: ",
        params: {
            min_new_tokens: 1,
            max_new_tokens: 80,
            repetition_penalty: 1.05,
            top_k: 50, 
            top_p: 0.75
        }
    },
    headline: {
        task_prefix: "",
        prompt: "\nWhat is the best title for this article? ",
        params: {
            min_new_tokens: 3,
            max_new_tokens: 20,
            length_penalty: 1.0,
            no_repeat_ngram_size: 0,
            repetition_penalty: 1.0,
            diversity_penalty: 0.0,
            num_beam_groups: 1,
            do_sample: false,
            temperature: 1.0,
            early_stopping: false,
            pad_token_id: 3,
            eos_token_id: 2,
            num_return_sequences: 1,
            top_k: 50, 
            top_p: 0.75
        }
    },
    teaser: {
        task_prefix: "",
        prompt: "\nWrite a one or two sentence news hook/teaser/lede/bait: ",
        params: {
            min_new_tokens: 30,
            max_new_tokens: 60,
            top_k: 50, 
            top_p: 0.75,
            no_repeat_ngram_size: 2,
        }
    },
    summary: {
        task_prefix: "",
        prompt: "\nSummarize in two to three sentences: ",
        params: {
            min_new_tokens: 50,
            max_new_tokens: 150,
            top_k: 50, 
            top_p: 0.75,
            no_repeat_ngram_size: 2,
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
                "modelKey": process.env.BANANA_MODEL_KEY_BLOOMZ, // **required -** the key giving you access to this model
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