import fetch from 'node-fetch'

export const handler = async (event, context, callback) => {
    var callID, genType, output, model;
    callID = event.queryStringParameters["id"];
    genType = event.queryStringParameters["gen_type"];
    model = event.queryStringParameters["model"];
    const model_response = await fetch("https://api.banana.dev/check/v4",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                "apiKey": process.env.BANANA_API_KEY, // **required -** your api key, for authorization
                "longPoll": false, // **suggested -** a flag telling the REST call wait on the server for results, up to 50s
                "callID" : callID // **required -** the async task ID to fetch results for
            })
        });
    out = await model_response.json();
    if (out.message == "success") {
        // handle successful response
        output = out['modelOutputs'][0]['output'];
        output = cleanOutput(output, genType, model);

        // Send response
        response = {
            statusCode: 200,
            body: JSON.stringify({
                "finished": true,
                "output": output
            }),
        };
    } else {
        console.log("No response yet:", out);
        response = {
            statusCode: 200,
            body: JSON.stringify({
                "finished": false,
                "callID": callID
            }),
        };
    }
    return response
}

const cleanOutput = (output, genType, model) => {
    // General text cleaning
    output = output.replace('\n', ' ');
    output = output.replaceAll('  ', ' ');
    output = output.replace('<|endoftext|>', '');
    // Model and snippet sepcific cleaning
    if (genType === "headline") {
        if (model === "gptj") {
          // GPT-J specific cleaning
          output = output.split("[Titel]:")[1];
        }
        // Generic cleaning
        output = output.split('\n')[0];
        output = output.split('.')[0];
        output = output.split('?')[0];
        output = output.split('!')[0];
      } else if (genType === "teaser") {
        if (model === "gptj") {
          // GPT-J specific cleaning
          output = output.split("[Teaser]:")[1];
        }
        output = output.split('.').slice(0, -1).join(".");
        output += '.';
      }
    // General text cleaning
    output = output.trim();
    return output
}