import {Connection, useContainer} from 'typeorm'
import { testConn } from '../../test-utils/testConn'
import {gCall} from '../../test-utils/gCall'
import {Container} from 'typedi'
import { createUser, createEvent, createEventComment } from '../../test-utils/fakeEntities';

let conn: Connection

beforeAll(async() => {
  useContainer(Container)
  conn = await testConn(true)
})

afterAll(async() => {
  if (conn?.close !== undefined)
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

const updateCommentMutation = `
  mutation UpdateEventComment($eventId: String!, $commentId: String!, $commentText: String!) {
    updateEventComment(eventId: $eventId, commentId: $commentId, commentText: $commentText) {
      id
      commentText
      createdBy {
        displayName
      }
    }
  }
`

const deleteCommentMutation = `
  mutation DeleteEventComment($eventCommentId: String!) {
    deleteEventComment(eventCommentId: $eventCommentId)
  }
`

describe("EventComment", () => {

  it("gets an event comment", async() => {

    const user = await createUser()
    const event = await createEvent(user)
    const comment = await createEventComment(user, event)

    const getCommentResponse = await gCall({
      source: eventCommentQuery,
      userId: user.id,
      variableValues: {id: comment.id}
    })

    expect(getCommentResponse.data).toMatchObject({
      eventComment: {
        id: comment.id,
        commentText: comment.commentText,
        createdBy: {
          displayName: user.displayName
        }
      }
    })
  })

  it("updates an event comment", async() => {

    const user = await createUser()
    const event = await createEvent(user)
    const comment = await createEventComment(user, event)
    const newCommentTxt = 'New Comment'

    const updateCommentResponse = await gCall({
      source: updateCommentMutation,
      userId: user.id,
      variableValues: {eventId: event.id, commentId: comment.id, commentText: newCommentTxt}
    })

    expect(updateCommentResponse.data).toMatchObject({
      updateEventComment : {
        id: comment.id,
        commentText: newCommentTxt,
        createdBy: {
          displayName: user.displayName
        }
      }
    })
  })

  it("deletes an event comment", async() => {
    const user = await createUser()
    const event = await createEvent(user)
    const comment = await createEventComment(user, event)

    const deleteCommentResponse = await gCall({
      source: deleteCommentMutation,
      userId: user.id,
      variableValues: {eventCommentId: comment.id}
    })

    event.remove()
    comment.remove()
    user.remove()

    expect(deleteCommentResponse.data.deleteEventComment).toEqual(1)
  })
})
