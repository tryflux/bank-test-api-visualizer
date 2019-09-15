const https = require('https');

const httpsRequest = (
  requestTimeout,
  method,
  urlAddress,
  headerProps,
  httpsFn,
  shouldWrite,
  body
) => {
  const urlInstance = new URL(urlAddress);
  const options = {
    hostname: urlInstance.hostname,
    path: `${urlInstance.pathname}${urlInstance.search}`,
    method: method,
    headers: {
      ...headerProps
    }
  };
  let chunks = '';
  return new Promise((resolve, reject) => {
    try {
      // likely https.get or https.request
      const clientRequest = https[httpsFn](options, (incomingMessage) => {
        const validResponsePayload = {
          statusCode: incomingMessage.statusCode,
          headers: incomingMessage.headers,
          data: null
        };
        incomingMessage.on('data', (dataResponse) => {
          chunks += dataResponse;
        });
        incomingMessage.on('end', () => {
          try {
            if (validResponsePayload.statusCode === 204) {
              resolve('');
            } else {
              validResponsePayload.data = JSON.parse(chunks);
            }
            resolve(validResponsePayload);
          } catch (error) {
            reject(error);
          }
        });
      });
      clientRequest.setTimeout(requestTimeout, () => {
        clientRequest.abort(); // manually abort the request
        // this will trigger the error event
      });
      clientRequest.on('error', (error) => {
        reject(error.message);
      });
      if (shouldWrite) {
        clientRequest.write(body);
      }
    } catch (error) {
      reject(error.message);
    }
  });
};

const put = (requestTimeout, urlAddress, headerProps, body) => {
  headerProps['Content-Length'] = Buffer.byteLength(body);
  return httpsRequest(
    requestTimeout,
    'PUT',
    urlAddress,
    headerProps,
    'request',
    true,
    body
  );
};

const post = (requestTimeout, urlAddress, headerProps, body) => {
  headerProps['Content-Length'] = Buffer.byteLength(body);
  return httpsRequest(
    requestTimeout,
    'POST',
    urlAddress,
    headerProps,
    'request',
    true,
    body
  );
};

const get = (requestTimeout, urlAddress, headerProps) => {
  headerProps['Content-Language'] = 'en-US';
  headerProps.Accept = 'application/json';
  return httpsRequest(
    requestTimeout,
    'GET',
    urlAddress,
    headerProps,
    'get',
    false,
    null
  );
};

module.exports = {
  get,
  post,
  put
};
