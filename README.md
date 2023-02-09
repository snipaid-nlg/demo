# Demo

You want to host the SnipAId Web GUI with Netlify? Read on...

## How to get started

The following tutorials assume, that you successfully deployed the model and have the model server up and running. If not, please refer to the tutorial in the [model-server](https://github.com/snipaid-nlg/model-server) repository.

If you choose to deploy this demo from Github with the Netlify Web User Interface (UI) and automatic build support read on [here](https://github.com/snipaid-nlg/demo-netlify#deploying-from-github-with-the-netlify-ui). \
If you choose to deploy manually with the help of the Netlify Command Line Interface (CLI) skip to [this section](https://github.com/snipaid-nlg/demo-netlify#deploying-manually-with-the-netlify-cli).

*Unsure which one fits your needs best? Here are some aspects to consider*

| Manual deploy with Netlify CLI                  	| Automatic deploy from GitHub with Netlify Web UI                           	|
|:-----------------------------------------------	|:---------------------------------------------------------------------------	|
| <ul><li>CLI usage required for both Git and Netlify</li><li>Needs manual deploy to update the site</li><li>Allows for private repository</li></ul> | <ul><li>Requires Web Interface interactions only</li><li>Site automatically updates with commits to the repository</li><li>Repository needs to be public to host site with Netlify on the free plan</li></ul>  	|

## Deploying from GitHub with the Netlify UI

1. Fork this repo as a public repository.

   > Note: The next steps assume you already have a Netlify account that is connected to your Git Provider. If you don’t already have a Netlify account, you can sign up for free [here](https://app.netlify.com/signup).

2. Login to your netlify account.
3. From the dashboard find the sites section and hit the "Add new site button" to create a new site. Select "Import an exisiting project"
4. Connect to GitHub.
5. Pick your forked repository.
6. Make sure publish directory is set to ```public``` (should be the default).
7. Hit the "Show advanced button" to set Environment Variables. 

    > Note: Running the demo requires 2 keys for accessing the model. If not already done, follow the tutorial on How to setup the model server in the repository [model-server](https://github.com/snipaid-nlg/model-server) to get your keys.

  - Klick the button "New Variable" and add the key ```BANANA_API_KEY``` with value ```InsertYourSecretBananaAPIKeyHere```.
  - Klick the button "New Variable" and add the Key ```BANANA_MODEL_KEY``` with value ```InsertYourSecretBananaModelKeyHere```.
  
    > Note: Fill in your personal model keys for InsertYourSecretBananaAPIKeyHere and InsertYourSecretBananaModelKeyHere.

8. Make sure the functions directory is set to ```netlify/functions``` (should be the default).

9. Check your configuration. It should now look like the image below.

    <img width="494" alt="Screenshot of the configuration for the import of an exisisting project from Github" src="https://user-images.githubusercontent.com/36483428/213718129-0ad92b5b-cbad-4f3d-931f-84763720296d.png">

10. Finally, hit the "Deploy site" button.

Wait for the build to finish. Done!

## Deploying manually with the Netlify CLI

### Setup

1. Run ```git clone https://github.com/snipaid-nlg/demo-netlify.git``` to clone the repository to your machine.
2. Change into the project direcory ```cd demo-netlify```.
3. Now that you have the project cloned and setup locally, we need to install the packages needed to run the serverless functions locally. First, make sure you have [Node.js](https://nodejs.org/en/) installed on your machine.

    > Note: You can check if you have it and what version by running ```npm --version```. 
    
    Now, we need to install the Netlify CLI. Run the following command in the terminal to install it globally on your machine.
```npm install netlify-cli --global```. 

    > Note: You can either use netlify or the shorthand ntl to run cli commands. I’ll be using the shorthand versions for the remainder of the tutorial. You can check the version you are running of the cli with ntl --version.

4. If you don’t already have a Netlify account, you can sign up for free [here](https://app.netlify.com/signup). Then you can login with the CLI by running ```ntl login``` and authorize the application.

    ![Authorizing the Application](https://user-images.githubusercontent.com/36483428/213727509-60628ee4-faa3-49a7-afe3-dff22fc7cd6c.png)

### Create a Netlify Site
Initialize the application and go through the steps to create a new site on Netlify.

1. Run ```ntl init``` and select "Create & configure a new site".
    
    <img width="360" alt="Initializing the application" src="https://user-images.githubusercontent.com/36483428/213725738-4f9051ce-e1dc-4e63-bc2d-fb4130c81723.png">

2. Select the team you want to use.

    <img width="160" alt="Selecting the team" src="https://user-images.githubusercontent.com/36483428/213728060-5a563418-0b8a-4f36-87cd-762ff695be4e.png">

3. Name your site or leave it blank for a random name.
    
    <img width="520" alt="Name your site" src="https://user-images.githubusercontent.com/36483428/213728401-14fa931d-64dc-4fdf-82a4-a1fb7225c0f7.png">

4. The site is now created. You should see your admin URL, the main URL, and the site id listed in the terminal.

    <img width="350" alt="SiteCreated" src="https://user-images.githubusercontent.com/36483428/213729085-e3ad0fd4-dbf7-43a1-8d86-44ac112a3ebc.png">

5. Next the CLI pompts you to connect your github account for webhooks and deploy keys. 

    <img width="700" alt="GithubAccess" src="https://user-images.githubusercontent.com/36483428/213729551-fa3b90b3-e32a-49ae-a463-4c8f0bb1d675.png">

    Just hit Ctrl+C to quit at this point to deploy manually.

### Set Environment variables

1. Add a file named ".env" to the root of the repository
2. Add your keys for the model. 

    ```
    BANANA_API_KEY = InsertYourSecretBananaAPIKeyHere
    BANANA_MODEL_KEY = InsertYourSecretBananaModelKeyHere
    ```

    > Note: Replace InsertYourSecretBananaAPIKeyHere and InsertYourSecretBananaModelKeyHere with your personal model keys. If you do not have these keys yet, follow the tutorial on How to setup the model server from the [model-server](https://github.com/snipaid-nlg/model-server) repository to get your keys.

3. With both keys in the .env file run the following command ```ntl env:import .env```.


### Develop and test locally

1. Install the required node packages with ```npm install```.
2. Start a local development server with ```ntl dev```.
3. Check the site at http://localhost:8888.
4. To stop the development server hit Ctrl+C.

From the Netlify Dashboard you will see, that the site is created but not deployed yet.
<img width="484" alt="NotDeployedYet-transparent" src="https://user-images.githubusercontent.com/36483428/213731950-b32f7a4e-8f7b-480a-906a-a493dca8ee5d.png">

### Deploy

1. Test the deployment with ```ntl deploy --dir=public --functions=netlify/functions```.

    <img width="542" alt="Successful draft deploy" src="https://user-images.githubusercontent.com/36483428/213733007-3a93838b-94d4-45c6-9b18-085690648d51.png">

2. If everything works as expected deploy to production with ```ntl deploy --dir=public --functions=netlify/functions --prod```.

    <img width="537" alt="Successful production deploy" src="https://user-images.githubusercontent.com/36483428/213733062-91cbc3e0-043d-466f-9e07-46fd938699bc.png">

From the Netlify Dashboard you will see, that the site is now live. Done! \
<img width="484" alt="Deployed-transparent" src="https://user-images.githubusercontent.com/36483428/213732481-74a36aec-6efc-43cb-93d2-8f9ea54bded9.png">
