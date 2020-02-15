import {Connection, useContainer} from 'typeorm'
import {name, internet} from 'faker'
import { testConn } from '../../test-utils/testConn'
import {gCall} from '../../test-utils/gCall'
import {User, Event, Registration, EventComment} from '../../entity'
import {Container} from 'typedi'
import {v4} from 'uuid'
import * as faker from 'faker'

let conn: Connection
let comment: EventComment
let user: User
let event: Event

beforeAll(async() => {

  useContainer(Container)
  conn = await testConn(true)

  user = await User.create({
    displayName: name.firstName(),
    email: internet.email(),
    id: 'commentUser'
  }).save()

  event = await Event.create({
    id: v4(),
    name: faker.lorem.sentence(),
    briefDescription: faker.lorem.sentence(),
    longDescription: faker.lorem.paragraph(),
    eventDate: faker.date.future(1),
    createdBy: user,
  }).save()

  comment = await EventComment.create({
    id: v4(),
    commentText: faker.lorem.paragraph(100),
    event: event,
    createdBy: user
  }).save()

})

afterAll(async() => {
  await conn.close()
})


const eventCommentQuery = `
  query EventComment($id: String!) {
    eventComment(id: $id) {
      id
      commentText
      createdBy {
        displayName
      }
    }  
  }
`

const eventCommentMutation = `
  mutation UpdateEventComment($eventId: String!, $commentId: String!, $commentText: String!) {
    updateEventComment(eventId: $eventId, commentId: $commentId, commentText: $commentText) {
      
    }
  }
`

describe("EventComment", () => {
  it("gets an event comment", () => {

  })
})
