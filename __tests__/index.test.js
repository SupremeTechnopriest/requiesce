import requiesce from '../src/index.js'

const url = 'https://api.edgemesh.com/org/:id/staff/:accountId'
const body = {
  id: 123,
  accountId: 2345,
  permission: 'READ'
}

console.log(requiesce(url, body))
