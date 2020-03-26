import { Connection, useContainer } from 'typeorm'
import { testConn } from '../../test-utils/testConn'
import { gCall } from '../../test-utils/gCall'
import { Container } from 'typedi'
import { createUser, createAddress, createEvent } from '../../test-utils/fakeEntities'
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

const updateEventMutation = `
  mutation UpdateEvent($eventData: EventUpdateInput!) { 
    updateEvent(eventData: $eventData) {
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

const deleteEventMutation = `
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
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

  it("updates an existing event if address and event details change", async() => {
    const user = await createUser()
    const event = await createEvent(user)

    const eventVariables = {
      id: event.id,
      name: 'new name',
      briefDescription: faker.lorem.sentence(),
      longDescription: faker.lorem.sentence(),
      eventDate: faker.date.future(1),
      address: {
        addr1: "380 Mather st",
        addr2: "",
        city: "Hamden",
        state: "CT",
        postal: "06518",
        country: "USA",
      }
    }
    
    const updateEventResponse = await gCall({
      source: updateEventMutation,
      userId: user.id,
      variableValues: {eventData: eventVariables}
    })

    expect(updateEventResponse.data).toMatchObject({
      updateEvent: {
        name: eventVariables.name,
        briefDescription: eventVariables.briefDescription,
        longDescription: eventVariables.longDescription,
        eventDate: eventVariables.eventDate.toISOString(),
        address: {
          lat: 41.356081,
          lng: -72.924167
        }
      }
    })
  })
  
  it("updates an existing event if address changes", async() => {
    
    const user = await createUser()
    const event = await createEvent(user)

    const eventVariables = {
      id: event.id,
      name: event.name,
      briefDescription: event.briefDescription,
      longDescription: event.longDescription,
      eventDate: event.eventDate,
      address: {
        addr1: "380 Mather st",
        addr2: "",
        city: "Hamden",
        state: "CT",
        postal: "06518",
        country: "USA",
      }
    }

    const updateEventResponse = await gCall({
      source: updateEventMutation,
      userId: user.id,
      variableValues: { eventData: eventVariables }
    })

    expect(updateEventResponse.data).toMatchObject({
      updateEvent: {
        name: event.name,
        briefDescription: event.briefDescription,
        longDescription: event.longDescription,
        eventDate: eventVariables.eventDate.toISOString(),
        address: {
          lat: 41.356081,
          lng: -72.924167
        }
      }
    })
  })

  it("deletes an existing event", async() => {

    const user = await createUser()
    const event = await createEvent(user)

    const deleteEventResponse = await gCall({
      source: deleteEventMutation,
      userId: user.id,
      variableValues: {id: event.id}
    })

    expect(deleteEventResponse.data.deleteEvent).toEqual(1)
  })
})