import {Connection, useContainer} from 'typeorm'
import {name, internet} from 'faker'
import { testConn } from '../../test-utils/testConn'
import {gCall} from '../../test-utils/gCall'
import {User} from '../../entity/User'
import {Container} from 'typedi'
import { createUser, createRegistration, createEvent } from '../../test-utils/fakeEntities';
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


const attendeeQuery = `
  query Attendee($id: String!) {
    attendee(id: $id) {
      event {
        id
        briefDescription
      }
      attendee {
        displayName
      }
    }
  } 
`

const addAttendeeMutation = `
  mutation AddAttendee($eventId: String!) {
    addAttendee(eventId: $eventId) {
      event {
        name
        briefDescription
        attendees {
          attendee {
            displayName
          }
        }
      }
    }
  }
`

const deleteAttendeeMutation = `
  mutation deleteAttendee($registrationId: String!) {
    deleteAttendee(registrationId: $registrationId)
  }
`

describe("Attendee", () => {
  it("gets an attendee", async() => {

    const user = await createUser()
    const event = await createEvent(user)
    const attendee = await createRegistration(user, event)
    
    const getAttendeeResponse = await gCall({
      source: attendeeQuery,
      userId: user.id,
      variableValues: {id: attendee.id}
    })

    expect(getAttendeeResponse.data).toMatchObject({
      attendee: {
        event: {
          id: event.id,
          briefDescription: event.briefDescription
        },
        attendee: {
          displayName: user.displayName
        }
      }
    })
  })

  it("adds an attendee", async() => {
    const user = await createUser()
    const event = await createEvent(user)

    const addAttendeeResponse = await gCall({
      source: addAttendeeMutation,
      userId: user.id,
      variableValues: { eventId: event.id }
    })

    expect(addAttendeeResponse.data).toMatchObject({
      addAttendee: {
        event: {
          name: event.name,
          briefDescription: event.briefDescription,
          attendees: [
            {
              attendee: {
                displayName: user.displayName
              }
            }
          ]
        }
      }
    })
  })

  it('removes an attendee', async() => {
    const user = await createUser()
    const event = await createEvent(user)
    const attendee = await createRegistration(user, event)

    const removeAttendeeResponse = await gCall({
      source: deleteAttendeeMutation,
      userId: user.id,
      variableValues: {registrationId: attendee.id}
    })

    expect(removeAttendeeResponse.data.deleteAttendee).toEqual(1)
  })

  it('fails trying to remove an attendee', async() => {
    const failingUser = await User.create({
      displayName: name.firstName(),
      email: internet.email(),
      id: faker.random.alphaNumeric()
    }).save()
    const user = await createUser()
    const event = await createEvent(user)
    const attendee = await createRegistration(user, event)

    const response = await gCall({
      source: deleteAttendeeMutation,
      userId: failingUser.id,
      variableValues: {registrationId: attendee.id}
    })

    expect(response).toHaveProperty('errors')
  })
})