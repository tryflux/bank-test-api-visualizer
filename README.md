# bank-test-api-visualizer
Standalone web app that allows easier use of the Flux Bank test API.

![Alt text](./screenshots/example.gif?raw=true "usage")

You should use this to explore the Flux Bank testing API. The Bank testing API is designed to help automate testing Flux receipt features for bank integrations. You should not use this simple webpage as a testing tool in your testing pipeline. This is designed to help visualize receipt features/fields.

## config

The following config must be set via environment variables:

```
FLUX_CLIENT_ID
FLUX_CLIENT_SECRET
```

These values can be provided from Flux. They will allow you to access the API.

Other config items are available such as what port to start the local web server on. See [config.js](./src/app/config/config.js)


## development

Firstly install node. Tested with latest (^12).
Check out the git repo
Run the following steps

```javascript
npm install
npm run start
```

The above will start a local web sever which allows local development. [Visit localhost](http://localhost:80/)

The following commands are available:

```javascript
npm run start //local express server
npm run lint // show linting
npm run lint:fix // prettier and eslint fixes
```
