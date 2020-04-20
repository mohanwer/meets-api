import * as faker from 'faker'
import { Event, User, Registration, EventComment, Address, Group } from '../entity'
import {v4} from 'uuid'
import * as rrad from 'rrad'
import { GroupMember } from '../entity/GroupMember';

export const createUser = async(userId?: string): Promise<User> =>
  await User.create({
    displayName: faker.name.firstName(),
    email: faker.internet.email(),
    id: userId ?? faker.random.alphaNumeric(5)
  }).save()

export const createUsers = async(numOfUsersToMake: number): Promise<User[]> => {
  const promises: (Promise<User>)[] = []
  for (let i = 0; i < numOfUsersToMake; i++)
    promises.push(createUser())
  return await Promise.all(promises)
}

export const createAddress = async(createdBy: User): Promise<Address> => {
  let randomAddress 
  
  // Sometimes the city is null so we need to retry another address if it is.
  do {
    randomAddress = rrad.addresses[Math.floor(Math.random() * rrad.addresses.length)]
  } while (randomAddress.city === null || randomAddress.city == undefined)
  
  return await Address.create({
    id: v4(),
    addr1: randomAddress.address1,
    addr2: randomAddress.address2,
    city: randomAddress.city,
    state: randomAddress.state,
    postal: randomAddress.postalCode,
    country: "USA",
    lat: randomAddress.coordinates.lat,
    lng: randomAddress.coordinates.lng,
    createdBy: createdBy
  }).save()
}

export const createEvent = async(createdBy: User): Promise<Event> => {
  const address = await createAddress(createdBy)
  return await Event.create({
    id: v4(),
    name: faker.company.catchPhrase(),
    briefDescription: faker.lorem.sentence(),
    longDescription: faker.lorem.paragraph(),
    eventDate: faker.date.future(1),
    createdBy: createdBy,
    address: address,
  }).save()
}

export const createEventComment = async(createdBy: User, event: Event): Promise<EventComment> =>
  await EventComment.create({
    id: v4(),
    commentText: faker.lorem.sentences(),
    event: event,
    createdBy: createdBy
  }).save()

export const createEventComments = async(numOfCommentsToAdd: number, users: User[], event: Event): Promise<EventComment[]> => {
  const commentPromises: (Promise<EventComment>)[] = []
  for(let i = 0; i < numOfCommentsToAdd; i++) {
    const userForComment = users[Math.floor(Math.random() * users.length)]
    commentPromises.push(createEventComment(userForComment, event))
  }
  return Promise.all(commentPromises)
}

export const createRegistration = async(createdBy: User, event: Event): Promise<Registration> =>
  await Registration.create({
    id: v4(),
    event: event,
    attendee: createdBy,
    created: new Date(),
    modified: new Date()
  }).save()

export const createRegistrations = async(numOfRegistrationsToAdd: number, users: User[], event: Event): Promise<Registration[]> => {
  const registrationPromises: (Promise<Registration>)[] = []
  for(let i = 0; i < numOfRegistrationsToAdd; i++) {
    const userToRegister = users[Math.floor(Math.random() * users.length)]
    registrationPromises.push(createRegistration(userToRegister, event))
  }
  return Promise.all(registrationPromises)
}

export const createGroup = async(createdBy: User): Promise<Group> =>
  await Group.create({
    id: v4(),
    about: faker.lorem.sentences(),
    createdBy: createdBy,
    created: new Date(),
    modified: new Date()
  }).save()

export const createGroupMember = async(memberUser: User, group: Group): Promise<GroupMember> =>
  await GroupMember.create({
    id: v4(),
    group: group,
    member: memberUser,
  }).save()