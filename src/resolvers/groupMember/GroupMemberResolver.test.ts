import {Connection, useContainer} from 'typeorm'
import { testConn } from '../../test-utils/testConn'
import {gCall} from '../../test-utils/gCall'
import {Container} from 'typedi'
import { createGroup, createUser, createGroupMember } from '../../test-utils/fakeEntities';

let conn: Connection

beforeAll(async() => {
  useContainer(Container)
  conn = await testConn(true)
})

afterAll(async() => {
  if (conn?.close !== undefined)
    await conn.close()
})

const addGroupMemberMutation = `
  mutation AddGroupMember($groupId: String!) {
    addGroupMember(groupId: $groupId) {
      group {
        id
        about
      }
      member {
        id
        displayName
      }
    }
  }
`

const deleteGroupMemberMutation = `
  mutation DeleteGroupMember($groupMembershipId: String!) {
      deleteGroupMember(groupMembershipId: $groupMembershipId)
  }
`

describe('GroupMemberResolver', () => {
  it('adds a user to a group', async() => {
    const user = await createUser()
    const group = await createGroup(user)

    const groupMemberVariables = {
      groupId: group.id
    }

    const groupMemberResponse = await gCall({
      source: addGroupMemberMutation,
      userId: user.id,
      variableValues: groupMemberVariables
    })
    
    expect(groupMemberResponse.data).toMatchObject({
      addGroupMember: {
        group: {
          about: group.about,
          id: group.id
        },
        member: {
          displayName: user.displayName,
          id: user.id,
        }
      }
    })
  })

  it('removes a user from a group', async() => {
    const user = await createUser()
    const group = await createGroup(user)
    const groupMembershipId = await createGroupMember(user, group)

    const groupRemoveVariables = {
      groupMembershipId: groupMembershipId.id
    }

    const groupMemberRemoveResponse = await gCall({
      source: deleteGroupMemberMutation,
      userId: user.id,
      variableValues: groupRemoveVariables,
    })

    expect(groupMemberRemoveResponse.data.deleteGroupMember).toEqual(1)
  })
})