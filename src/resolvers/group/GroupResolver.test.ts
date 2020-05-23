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
  mutation AddGroup($groupInfo: GroupInput!) {
    addGroup(groupInfo: $groupInfo) {
      name
      about
    }
  }
`

const updateGroupMutation = `
  mutation UpdateGroup($groupId: String!, $groupInfo: GroupInput!) {
    updateGroup(groupId: $groupId, groupInfo: $groupInfo) {
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
      name: faker.lorem.words(5),
      location: faker.address.zipCode()
    }

    const addGroupResponse = await gCall({
      source: addGroupMutation,
      userId: user.id,
      variableValues: {groupInfo: groupVariables}
    })
    
    expect(addGroupResponse.data).toMatchObject({
      addGroup: {
        about: groupVariables.about,
        name: groupVariables.name
      }
    })
  })

  it('updates a group', async() => {
    const user = await createUser()
    const group = await createGroup(user)
    const address = await group.generalAddress
    const newAbout = "new about text"

    const updateGroupResponse = await gCall({
      source: updateGroupMutation,
      userId: user.id,
      variableValues: {
        groupId: group.id,
        groupInfo: {
          name: group.name,
          about: newAbout,
          location: address.address
        }
      }
    })

    expect(updateGroupResponse.data).toMatchObject({
      updateGroup: {
        about: newAbout,
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