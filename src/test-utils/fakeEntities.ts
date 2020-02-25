import * as faker from 'faker'
import { Event, User, Registration, EventComment, Address } from '../entity'
import {v4} from 'uuid'

export const createUser = async(userId?: string): Promise<User> =>
  await User.create({
    displayName: faker.name.firstName(),
    email: faker.internet.email(),
    id: userId ?? faker.random.alphaNumeric(5)
  }).save()

export const createAddress = async(createdBy: User): Promise<Address> => 
  await Address.create({
    id: v4(),
    addr1: "888 E 66th St.",
    addr2: "420",
    city: "Indianapolis",
    state: "IN",
    postal: "46220",
    country: "USA",
    lat: 39.876155,
    lng: -86.143854,
    createdBy: createdBy
  }).save()

export const createEvent = async(createdBy: User): Promise<Event> => {
  const address = await createAddress(createdBy)
  return await Event.create({
    id: v4(),
    name: faker.lorem.sentence(),
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

export const createRegistration = async(createdBy: User, event: Event): Promise<Registration> =>
  await Registration.create({
    id: v4(),
    event: event,
    attendee: createdBy,
    created: new Date(),
    modified: new Date()
  }).save()