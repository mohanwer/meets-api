import { createEvent } from './fakeEntities'
import {createEventIndex, client, deleteEventIndex} from '../services/elastic'
import { Address, User, Event } from '../entity';

export const seedEvents = async() => {
  deleteEventIndex()
    .then(async() => {
      await Promise.all([
        Event.delete({}),
        Address.delete({}),
      ])
    })
    .then(async() => await createEventIndex())

  //Dev user should always be in the dev database.
  const userId = process.env.DEV_USER
  const promises: (Promise<Event>)[] = []
  const myUser = await User.findOne(userId)
  const eventsCount = 99
  for(let i = 0; i < eventsCount; i++) {
    console.log(`seeding event ${i} of ${eventsCount}`)
    promises.push(createEvent(myUser))
  }
  const events = await Promise.all(promises)
  const eventDoc = events.map(event => mapEventDoc(event))
  const body = eventDoc.flatMap(doc => [{index: {_index: 'events' }}, doc])
  await client.bulk({body})
}

const mapEventDoc = (event: any) => ({
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