import {Connection, useContainer} from 'typeorm'
import {name, internet} from 'faker'
import { testConn } from '../../test-utils/testConn'
import {gCall} from '../../test-utils/gCall'
import {User} from '../../entity/User'
import {Container} from 'typedi'
import {Event} from '../../entity/Event'
import {Attendee} from '../../entity/Attendee'
import {v4} from 'uuid'
import * as faker from 'faker'

let conn: Connection
let user: User
let event: Event
let attendee: Attendee

beforeAll(async() => {

  useContainer(Container)
  conn = await testConn(true)
  user = await User.create({
    displayName: name.firstName(),
    email: internet.email(),
    id: 'testUserAttendee'
  }).save()

  event = await Event.create({
    id: v4(),
    name: faker.lorem.sentence(),
    briefDescription: faker.lorem.sentence(),
    longDescription: faker.lorem.paragraph(),
    eventDate: faker.date.future(1),
    created: new Date(),
    modified: new Date(),
    createdBy: user,
  }).save()

  attendee = await Attendee.create({
    id: v4(),
    event: event,
    attendee: user,
    created: new Date(),
    modified: new Date()
  }).save()

})

afterAll(async() => {
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

describe("Attendee", () => {
  it("gets an attendee", async() => {
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
            },
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
})
