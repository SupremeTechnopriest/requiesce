# Requiest

A request part maker for lazy developers. You can pass it a parameterized url and an object, and it will return a requestable url and a body object with the remaining data not used in url completion.

## Example
```js
import requiest from 'requiest'

const requestUrl = `https://api.mysite.com/accounts/:id/assets/:assetId`
const requestBody = {
  id: 12345,
  assetId: 67890,
  type: 'image' 
}

const { url, body } = requiest(requestUrl, requestBody)

// url: https://api.mysite.com/accounts/12345/assets/67890
// body: { type: 'image' }

fetch(url, { method: 'POST', body })

```