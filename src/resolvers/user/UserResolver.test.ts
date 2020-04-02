import {Connection, useContainer} from 'typeorm'
import {name, internet} from 'faker'
import { testConn } from '../../test-utils/testConn'
import { gCall } from '../../test-utils/gCall'
import { Container } from 'typedi'
import { createUser } from '../../test-utils/fakeEntities';
import * as faker from 'faker';

let conn: Connection

beforeAll(async() => {
  useContainer(Container)
  conn = await testConn(true)
})

afterAll(async() => {
  if (conn?.close !== undefined)
    await conn.close()
})

const userQuery = `
  query GetUser($id: String!) {
    getUser(id: $id) {
      id
      displayName
      email
    }
  }
`

const addUserMutation = `
mutation AddUser($userData: UserInput!) {
  addUser(userData: $userData) {
      id
      displayName
  }
}
`

describe("User", () => {
  it("adds a user", async() => {
    const testUser = {
      displayName: name.firstName(),
      email: internet.email(),
      id: faker.random.alphaNumeric()
    }

    const addUserResponse = await gCall({
      source: addUserMutation,
      userId: testUser.id,
      variableValues: {userData: testUser}
    })

    expect(addUserResponse.data).toMatchObject({
      addUser: {
        id: testUser.id,
        displayName: testUser.displayName
      }
    })
  })

  it("gets a user", async() => {
    const user = await createUser()

    const response = await gCall({
      source: userQuery,
      userId: user.id,
      variableValues: {id: user.id}
    })

    expect(response.data).toMatchObject({
      getUser: {
        id: user.id,
        displayName: user.displayName,
        email: user.email
      }
    })
  })
})
