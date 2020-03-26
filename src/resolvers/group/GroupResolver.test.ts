import { Connection, useContainer } from 'typeorm'
import { testConn } from '../../test-utils/testConn'
import { gCall } from '../../test-utils/gCall'
import { Container } from 'typedi'
import * as faker from 'faker'
import { createUser, createGroup } from '../../test-utils/fakeEntities'

let conn: Connection

beforeAll(async() => {
  useContainer(Container)
  conn = await testConn(true)
})

afterAll(async() => {
  if (conn?.close !== undefined)
    await conn.close()
})

const addGroupMutation = `
  mutation AddGroup($about: String!) {
    addGroup(about: $about) {
      about
    }
  }
`

const updateGroupMutation = `
  mutation UpdateGroup($groupId: String!, $about: String!) {
    updateGroup(groupId: $groupId, about: $about) {
      id
      about
    }
  }
`

const deleteGroupMutation = `
  mutation deleteGroup($groupId: String!) {
    deleteGroup(groupId: $groupId)
  }
`

describe('Group', () => {
  it('adds a group', async() => {
    const user = await createUser()

    const groupVariables = {
      about: faker.lorem.sentence(),
    }

    const addGroupResponse = await gCall({
      source: addGroupMutation,
      userId: user.id,
      variableValues: groupVariables
    })
    
    expect(addGroupResponse.data).toMatchObject({
      addGroup: {
        about: groupVariables.about
      }
    })
  })

  it('updates a group', async() => {
    const user = await createUser()
    const group = await createGroup(user)
    const newAbout = "new about text"

    const updateGroupResponse = await gCall({
      source: updateGroupMutation,
      userId: user.id,
      variableValues: {
        groupId: group.id,
        about: newAbout,
      }
    })

    expect(updateGroupResponse.data).toMatchObject({
      updateGroup: {
        about: newAbout,
        id: group.id,
      }
    })
  })

  it('deletes a group', async() => {
    const user = await createUser()
    const group = await createGroup(user)

    const deleteGroupResponse = await gCall({
      source: deleteGroupMutation,
      userId: user.id,
      variableValues: {
        groupId: group.id
      }
    })

    expect(deleteGroupResponse.data.deleteGroup).toEqual(1)
  })
})