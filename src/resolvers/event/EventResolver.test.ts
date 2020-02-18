import { Connection, useContainer } from 'typeorm'
import { testConn } from '../../test-utils/testConn'
import { gCall } from '../../test-utils/gCall';
import { Container } from 'typedi';
import { createUser, createAddress } from '../../test-utils/fakeEntities';
import * as faker from 'faker'

let conn: Connection

beforeAll(async() => {
  useContainer(Container)
  conn = await testConn(true)
})

afterAll(async() => {
  if (conn?.close !== undefined)
    await conn.close()
})

const addEventMutation = `
  mutation AddEvent($eventData: EventInput!) {
    addEvent(eventData: $eventData) {
      name
      briefDescription
      longDescription
      eventDate
      address {
        lat
        lng
      }
    }
  }
`

describe("Event", () => {
  it("adds an event", async() => {
    const user = await createUser()
    
    const eventVariables = {
        name: faker.lorem.words(5),
        briefDescription: faker.lorem.sentence(),
        longDescription: faker.lorem.sentence(),
        eventDate: faker.date.future(1),
        address: {
          addr1: "888 E 66th St.",
          addr2: "420",
          city: "Indianapolis",
          state: "IN",
          postal: "46220",
          country: "USA",
        }
      }

    const addEventResponse = await gCall({
      source: addEventMutation,
      userId: user.id,
      variableValues: {eventData: eventVariables}
    })

     expect(addEventResponse.data).toMatchObject({
      addEvent: {
        name: eventVariables.name,
        briefDescription: eventVariables.briefDescription,
        longDescription: eventVariables.longDescription,
        eventDate: eventVariables.eventDate.toISOString(),
        address: {
          lat: 39.876155,
          lng: -86.143854
        }
      }
    })
  })

  it("adds an event with pre-existing address", async() => {
    const user = await createUser()
    //Create a pre-existing address.
    await createAddress(user)

    const eventVariables = {
      name: faker.lorem.words(5),
      briefDescription: faker.lorem.sentence(),
      longDescription: faker.lorem.sentence(),
      eventDate: faker.date.future(1),
      address: {
        addr1: "888 E 66th St.",
        addr2: "420",
        city: "Indianapolis",
        state: "IN",
        postal: "46220",
        country: "USA",
      }
    }

    const addEventResponse = await gCall({
      source: addEventMutation,
      userId: user.id,
      variableValues: {eventData: eventVariables}
    })

    expect(addEventResponse.data).toMatchObject({
      addEvent: {
        name: eventVariables.name,
        briefDescription: eventVariables.briefDescription,
        longDescription: eventVariables.longDescription,
        eventDate: eventVariables.eventDate.toISOString(),
        address: {
          lat: 39.876155,
          lng: -86.143854
        }
      }
    })
  })
})