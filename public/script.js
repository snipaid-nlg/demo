window.onload = function () {
    var consent = document.getElementById('consent');
    var submitText = document.getElementById('submitText');
    var articleInput = document.getElementById('articleInput');
    var loadingDiv = document.getElementById('loadingDiv');
    var resultDiv = document.getElementById('resultDiv');
    var resTeaser = document.getElementById('resTeaser');
    var resHeadline = document.getElementById('resHeadline');
    console.log('resultDiv', resultDiv)

    consent.addEventListener('change', (event) => {
      console.log('event', event.currentTarget.checked)
      if (event.currentTarget.checked) {
        submitText.disabled = false;
      } else {
        submitText.disabled = true;
      }
    }, false);

    var isHeadlineLoaded = false;
    var isTeaserLoaded = false;
    var setLoading = function (to) {
      if (to) {
        isHeadlineLoaded = false;
        isTeaserLoaded = false;
        loadingDiv.classList.remove("d-none");
        submitText.classList.add("d-none");
      } else if (isHeadlineLoaded && isTeaserLoaded) {
        loadingDiv.classList.add("d-none")
        submitText.classList.remove("d-none");
      }
    }

    function updateHeadline(headline) {
      console.log("Got title:", headline);
      isHeadlineLoaded = true;
      resHeadline.innerText = headline;
      setLoading(false);
      resultDiv.classList.remove('d-none')
    }

    var updateTeaser = (teaser) => {
      console.log("Got teaser:", teaser);
      isTeaserLoaded = true;
      resTeaser.innerText = teaser;
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

    var checkResult = async (callID, genType) => {
      const response = await fetch('/.netlify/functions/check?' + new URLSearchParams({
          "id": callID,
          "gen_type": genType,
        })
      );
      // Set timeout for retries here
      const timeout = 10000
      if (response.status == 500) {
        // Try again in a few seconds
        console.log(`Attempt retry in ${timeout%1000} seconds...`);
        setTimeout(checkResult, timeout, callID, genType); 
      } else {
        // Periodically check for results
        const data = await response.json();
        console.log("Response data:", data);
        if (data.finished==true) {
          // update and do not run again
          update(data.output, genType)
        } else {
          // check again after timeout
          console.log(`Still Processing... check again in ${timeout%1000} seconds...`);
          setTimeout(checkResult, timeout, callID, genType); 
        }
      }
    }

    submitText.addEventListener('click', async (event) => {
      console.log('event', 'articleInput', articleInput.value)
      setLoading(true);
      resultDiv.classList.add('d-none')

      let prompts = []

      try {
        console.log("Generate title...")
        const headlineResponse = await fetch('/.netlify/functions/generate?' + new URLSearchParams({
          "fulltext": articleInput.value,
          "gen_type": "headline"
        }))
        const data = await headlineResponse.json()
        checkResult(data.callID, "headline")
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }

      try {
        console.log("Generate teaser...")
        const teaserResponse = await fetch('/.netlify/functions/generate?' + new URLSearchParams({
          "fulltext": articleInput.value,
          "gen_type": "teaser"
        }))
        const data = await teaserResponse.json()
        checkResult(data.callID, "teaser")
      } catch (err) {
        //textBlock.innerHTML = "Sorry the request failed"
      }
    })
  }