import { createEvent, createUser, createEventComments, createRegistrations } from './fakeEntities';
import {createEventIndex, client, deleteEventIndex} from '../services/elastic'
import { User, Event, EventComment, Registration, SeedResult } from '../entity';

export const seedEvents = async(): Promise<SeedResult[]> => {
  const eventPromises: (Promise<Event>)[] = []
  const userPromises: (Promise<User>)[] = []
  const commentPromises: (Promise<EventComment[]>)[] = []
  const registrationPromises: (Promise<Registration[]>[]) = []
  const eventsCount = 200
  const eventCommentCount = 5
  const eventRegistrationCount = 5
  await Event.query('truncate table users cascade')
  await deleteEventIndex()
  await createEventIndex()

  //Dev user should always be in the dev database.
  const myUser = await User.create({
    displayName: process.env.DEV_USER_DISPLAY_NAME,
    email: process.env.DEV_USER_EMAIL,
    id: process.env.DEV_USER
  }).save()
  
  for(let i = 0; i < eventsCount; i++) {
    eventPromises.push(createEvent(myUser))
    userPromises.push(createUser())
  }

  const events = await Promise.all(eventPromises)
  const users = await Promise.all(userPromises)

  const eventDoc = events.map(event => {
    registrationPromises.push(createRegistrations(eventRegistrationCount, users, event))
    commentPromises.push(createEventComments(eventCommentCount, users, event))
    return mapEventDoc(event)
  })
  
  const body = eventDoc.flatMap(doc => [{index: {_index: 'events' }}, doc])

  await client.bulk({body})
  await Promise.all(commentPromises)
  await Promise.all(registrationPromises)
  
  const result: SeedResult[] = [
    {
      tableName: 'events',
      rowsSeeded: eventsCount,
    },
    {
      tableName: 'event_comments',
      rowsSeeded: eventsCount * eventCommentCount,
    }, 
    {
      tableName: 'registration (event_attendees)',
      rowsSeeded: eventsCount * eventRegistrationCount,  
    },
    {
      tableName: 'users',
      rowsSeeded: eventsCount // The same # of users are created as events. I just used the same loop above to generage both.
    }
  ]

  return result
}

const mapEventDoc = (event: any) => ({
    id: event.id,
    name: event.name,
    briefDescription: event.briefDescription,
    longDescription: event.longDescription,
    eventDate: event.eventDate,
    userId: event.__createdBy__.id,
    email: event.__createdBy__.email,
    displayName: event.__createdBy__.displayName,
    addressId: event.__address__.id,
    addr1: event.__address__.addr1,
    addr2: event.__address__.addr2,
    city: event.__address__.city,
    state: event.__address__.state,
    postal: event.__address__.postal,
    country: event.__address__.country,
    location: {
      lat: event.__address__.lat,
      lon: event.__address__.lng
    }
})