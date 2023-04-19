window.onload = function () {
  var consent = document.getElementById('consent');
  var submitText = document.getElementById('submitText');
  var articleInput = document.getElementById('articleInput');
  var loadingDiv = document.getElementById('loadingDiv');
  var resultDiv = document.getElementById('resultDiv');
  var resTeaser = document.getElementById('resTeaser');
  var resHeadline = document.getElementById('resHeadline');
  var resSummary = document.getElementById('resSummary');
  var resKeywords = document.getElementById('resKeywords');
  var headlineDiv = document.getElementById('headlineDiv');
  var teaserDiv = document.getElementById('teaserDiv');
  var summaryDiv = document.getElementById('summaryDiv');
  var keywordsDiv = document.getElementById('keywordsDiv');
  var serpDiv = document.getElementById('serpDiv');
  var resSerpTitle = document.getElementById('resSerpTitle');
  var resSerpDescription = document.getElementById('resSerpDescription');
  var tweetDiv = document.getElementById('tweetDiv');
  var webhookDiv = document.getElementById('accordion')
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

  // Add event listener for model change
  model.addEventListener('change', (event) => {
    console.log("Selected model:", model.value)
    headlineDiv.classList.add("d-none");
    teaserDiv.classList.add("d-none");
    summaryDiv.classList.add("d-none");
    keywordsDiv.classList.add("d-none");
    webhookDiv.classList.add("d-none");
    serpDiv.classList.add("d-none");
    tweetDiv.classList.add("d-none");
  })

  // Initialize loading state variables for headline and teaser
  var isHeadlineLoaded = false;
  var isTeaserLoaded = false;
  var isKeywordsLoaded = false;
  var isSummaryLoaded = false;
  var isSerpLoaded = false;
  var isTweetLoaded = false;

  var setLoading = function(isLoading) {
    if (isLoading) {
      // Set loading indicators
      isHeadlineLoaded = false;
      isTeaserLoaded = false;
      isKeywordsLoaded = false;
      isSummaryLoaded = false;
      isSerpLoaded = false;
      isTweetLoaded = false;
      if (model.value == 'gptj' || model.value == 'bloomz') {
        // Set loading indicators for snippets not supported with bloomz and gptj to true for evaluation
        isSerpLoaded = true;
        isTweetLoaded = true;
      } else if (model.value == 'gptj') {
        // Set loading indicators for snippets not supported with gptj to true for evaluation
        isKeywordsLoaded = true;
        isSummaryLoaded = true;
      }
      // Show loading div
      loadingDiv.classList.remove("d-none");
      // Hide snippet divs, webhook and submit button
      headlineDiv.classList.add("d-none");
      teaserDiv.classList.add("d-none");
      summaryDiv.classList.add("d-none");
      keywordsDiv.classList.add("d-none");
      serpDiv.classList.add("d-none");
      tweetDiv.classList.add("d-none");
      webhookDiv.classList.add("d-none");
      submitText.classList.add("d-none");
    } else {
      // Evaluate: Is generation done?
      if (isHeadlineLoaded && isTeaserLoaded && isKeywordsLoaded && isSummaryLoaded && isSerpLoaded && isTweetLoaded) {
        // Generation is done, hide laoding indicator
        loadingDiv.classList.add("d-none");
        // Show webhook and allow new text submission
        webhookDiv.classList.remove("d-none");
        submitText.classList.remove("d-none");
      }
    }
  }

  // Functions updating snippet fields
  function updateHeadline(headline) {
    console.log("Generated title:", headline);
    isHeadlineLoaded = true;
    resHeadline.value = headline;
    setLoading(false);
    headlineDiv.classList.remove('d-none')
  }

  var updateTeaser = (teaser) => {
    console.log("Generated teaser:", teaser);
    isTeaserLoaded = true;
    resTeaser.value = teaser;
    setLoading(false);
    teaserDiv.classList.remove('d-none')
  }

  var updateSummary = (summary) => {
    console.log("Generated summary:", summary);
    isSummaryLoaded = true;
    resSummary.value = summary;
    setLoading(false);
    summaryDiv.classList.remove('d-none')
  }

  var updateKeywords = (keywords) => {
    console.log("Generated keywords:", keywords);
    isKeywordsLoaded = true;
    resKeywords.value = keywords;
    setLoading(false);
    keywordsDiv.classList.remove('d-none')
  }

  var updateSerp = (serp) => {
    console.log("Generated serp:", serp);
    isSerpLoaded = true;

    // Split SERP into title tag and meta description
    serp = serp.replace("\n", "");
    serp = serp.replace("Title-Tag:", "");

    console.log("Serp-Text before split:", serp)

    splits = serp.split("Meta-Description:");
    var serpTitle = splits[0]
    var serpDescription = splits[1]

    serpTitle = serpTitle.replace("|", "").trim()
    serpDescription = serpDescription.trim()

    console.log("Serp-Title after split:", serpTitle)
    console.log("Serp-Desc after split:", serpDescription)

    resSerpTitle.value = serpTitle; 
    resSerpDescription.value = serpDescription;
    setLoading(false);
    serpDiv.classList.remove('d-none')
  }

  var updateTweet = (tweet) => {
    console.log("Generated tweet:", tweet);
    isTweetLoaded = true;
    resTweet.value = tweet;
    setLoading(false);
    tweetDiv.classList.remove('d-none')
  }

  var update = (output, genType) => {
    switch (genType) {
      case 'headline':
        updateHeadline(output)
        break;
      case 'teaser':
        updateTeaser(output)
        break;
      case 'summary':
        updateSummary(output)
        break;
      case 'keywords':
        updateKeywords(output)
        break;
      case 'serp':
        updateSerp(output)
        break;
      case 'tweet':
        updateTweet(output)
        break;
      default:
        console.log(`Sorry, the snippet type ${genType} is not supported.`);
    }
  }

  // Function to check generation results
  var checkResult = async (callID, genType, model) => {
    const response = await fetch('/.netlify/functions/check?' + new URLSearchParams({
      "id": callID,
      "gen_type": genType,
      "model": model
    })
    );
    // Set timeout for retries here
    const timeout = 10000
    if (!response.ok) {
      // Try again in a few seconds
      console.log(`Still generating... check again in ${timeout / 1000} seconds...`);
      setTimeout(checkResult, timeout, callID, genType, model);
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
        setTimeout(checkResult, timeout, callID, genType, model);
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
    } else if (model === "snip-igel") {
      return fetch('/.netlify/functions/generate-igel?' + new URLSearchParams({
        "fulltext": fulltext,
        "gen_type": genType
      }))
    }
  }

  // Trigger snippet generation process on text submit
  submitText.addEventListener('click', async (event) => {
    console.log('Received article input:', articleInput.value)
    setLoading(true);

    try {
      console.log("Generate title...")
      const headlineResponse = await generate(articleInput.value, "headline", model.value);
      const data = await headlineResponse.json()
      checkResult(data.callID, "headline", model.value)
    } catch (err) {
      //textBlock.innerHTML = "Sorry the request failed"
    }

    try {
      console.log("Generate teaser...")
      const teaserResponse = await generate(articleInput.value, "teaser", model.value);
      const data = await teaserResponse.json()
      checkResult(data.callID, "teaser", model.value)
    } catch (err) {
      //textBlock.innerHTML = "Sorry the request failed"
    }

    if (model.value === 'bloomz' || model.value === "snip-igel") {
      try {
        console.log("Generate summary...")
        const summaryResponse = await generate(articleInput.value, "summary", model.value);
        const data = await summaryResponse.json()
        checkResult(data.callID, "summary", model.value)
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }
  
      try {
        console.log("Generate keywords...")
        const keywordResponse = await generate(articleInput.value, "keywords", model.value);
        const data = await keywordResponse.json()
        checkResult(data.callID, "keywords", model.value)
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }
    }

    if (model.value === "snip-igel") {
      try {
        console.log("Generate serp...")
        const serpResponse = await generate(articleInput.value, "serp", model.value);
        const data = await serpResponse.json()
        checkResult(data.callID, "serp", model.value)
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }
  
      try {
        console.log("Generate tweet...")
        const tweetResponse = await generate(articleInput.value, "tweet", model.value);
        const data = await tweetResponse.json()
        checkResult(data.callID, "tweet", model.value)
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }
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
          "teaser": resTeaser.value,
        })
      });
    alertWebhookStatus(response.status);
  });
}