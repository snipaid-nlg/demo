window.onload = function () {
  var consent = document.getElementById('consent');
  var submitText = document.getElementById('submitText');
  var articleInput = document.getElementById('articleInput');
  var loadingDiv = document.getElementById('loadingDiv');
  var resultDiv = document.getElementById('resultDiv');
  var resTeaser = document.getElementById('resTeaser');
  var resHeadline = document.getElementById('resHeadline');
  var webhookInput = document.getElementById('webhookInput')
  var sendToWebhook = document.getElementById('sendToWebhook')
  var webhookStatus = document.getElementById('webhookStatus')
  var model = document.getElementById('model')

  // Add event listener to consent checkbox
  consent.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
      submitText.disabled = false;
    } else {
      submitText.disabled = true;
    }
  }, false);

  // Initialize loading state variables for headline and teaser
  var isHeadlineLoaded = false;
  var isTeaserLoaded = false;

  // Setter for loading indicator
  var setLoading = function (to) {
    if (to) {
      isHeadlineLoaded = false;
      isTeaserLoaded = false;
      loadingDiv.classList.remove("d-none");
      submitText.classList.add("d-none");
    } else if (isHeadlineLoaded && isTeaserLoaded) {
      loadingDiv.classList.add("d-none");
      submitText.classList.remove("d-none");
    }
  }

  // Functions updating snippet fields
  function updateHeadline(headline) {
    console.log("Generated title:", headline);
    isHeadlineLoaded = true;
    resHeadline.value = headline;
    setLoading(false);
    resultDiv.classList.remove('d-none')
  }

  var updateTeaser = (teaser) => {
    console.log("Generated teaser:", teaser);
    isTeaserLoaded = true;
    resTeaser.value = teaser;
    setLoading(false);
    resultDiv.classList.remove('d-none')
  }

  var update = (output, genType) => {
    switch (genType) {
      case 'headline':
        updateHeadline(output)
        break;
      case 'teaser':
        updateTeaser(output)
        break;
      default:
        console.log(`Sorry, the snippet type ${genType} is not supported.`);
    }
  }

  // Function to check generation results
  var checkResult = async (callID, genType) => {
    const response = await fetch('/.netlify/functions/check?' + new URLSearchParams({
      "id": callID,
      "gen_type": genType,
    })
    );
    // Set timeout for retries here
    const timeout = 10000
    if (!response.ok) {
      // Try again in a few seconds
      console.log(`Still generating... check again in ${timeout / 1000} seconds...`);
      setTimeout(checkResult, timeout, callID, genType);
    } else {
      // Periodically check for results
      const data = await response.json();
      console.log("Response data:", data);
      if (data.finished == true) {
        // update and do not run again
        update(data.output, genType)
      } else {
        // check again after timeout
        console.log(`Not finished yet... check again in ${timeout / 1000} seconds...`);
        setTimeout(checkResult, timeout, callID, genType);
      }
    }
  }

  // Generation with different model
  var generate = (fulltext, genType, model) => {
    if (model === "gptj") {
      return fetch('/.netlify/functions/generate-gptj?' + new URLSearchParams({
        "fulltext": fulltext,
        "gen_type": genType
      }))
    } else if (model === "bloomz") {
      return fetch('/.netlify/functions/generate-bloomz?' + new URLSearchParams({
        "fulltext": fulltext,
        "gen_type": genType
      }))
    }
  }

  // Trigger snippet generation process on text submit
  submitText.addEventListener('click', async (event) => {
    console.log('Received article input:', articleInput.value)
    setLoading(true);
    resultDiv.classList.add('d-none')

    try {
      console.log("Generate title...")
      const headlineResponse = await generate(articleInput.value, "headline", model.value);
      const data = await headlineResponse.json()
      checkResult(data.callID, "headline")
    } catch (err) {
      //textBlock.innerHTML = "Sorry the request failed"
    }

    try {
      console.log("Generate teaser...")
      const teaserResponse = await generate(articleInput.value, "teaser", model.value);
      const data = await teaserResponse.json()
      checkResult(data.callID, "teaser")
    } catch (err) {
      //textBlock.innerHTML = "Sorry the request failed"
    }
  })

  //Webhook url valididty check
  webhookInput.addEventListener('change', (event) => {
    //Disables webhook send button as long as entered url is invalid
    if (event.currentTarget.validity.valid) {
      sendToWebhook.disabled = false;
    } else {
      sendToWebhook.disabled = true;
    }
  })

  // Default: Webhook status alert is hidden
  $("#webhookStatus").hide()

  // Indicate webhook status with regards to HTTP status code
  const alertWebhookStatus = (status) => {
    if (status / 100 == 2){
      // HTTP 2xx successful
      webhookStatus.classList.remove("alert-secondary")
      webhookStatus.classList.add("alert-success")
      webhookStatus.innerText = "Success!"
    } else {
      // Something is wrong
      webhookStatus.classList.remove("alert-success")
      webhookStatus.classList.add("alert-secondary")
      webhookStatus.innerText = `Data was not received! Receiver responded with HTTP status ${status}.`
    }
    // Show the alert
    $("#webhookStatus").fadeIn().delay(3000).fadeOut();
  }

  // Send data to webhook url
  sendToWebhook.addEventListener('click', async (event) => {
    const endpoint = webhookInput.value;
    const response = await fetch(endpoint,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          "fulltext": articleInput.value,
          "title": resHeadline.value,
          "teaser": resTeaser.value
        })
      });
    alertWebhookStatus(response.status);
  });
}