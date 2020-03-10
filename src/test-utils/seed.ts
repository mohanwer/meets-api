import { createAddress, createEvent, createUser, createEventComment, createRegistration } from './fakeEntities';
import { User } from '../entity/User';
import { Event } from '../entity/Event';
import { createEventIndex, updateEventIndex, client } from '../services/elastic';

export const seedEvents = async() => {
  //Dn't seed the database if theres data existing in events table.
  const count = await Event.createQueryBuilder().select('count(*)').getCount()
  if (count > 0) return;

  //Dev user should always be in the dev database.
  const userId = process.env.DEV_USER
  const promises: (Promise<Event>)[] = []
  const myUser = await User.findOne(userId)
  for(let i = 0; i < 100; i++) {
    console.log(`seeding event ${i} of 99`)
    promises.push(createEvent(myUser))
  } 
  const events = await Promise.all(promises)
  const body = events.flatMap(doc => [{index: {_index: 'events' }}, doc])
  const {body: bulkResponse} = await client.bulk({body})
}
