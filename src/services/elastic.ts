import {Client} from '@elastic/elasticsearch'
import { Event } from '../entity/Event';

export const client = new Client({node: process.env.ELASTIC_HOST})

export const createEventIndex = async() => {
  //If index exists then stop index creation.
  const idxExists = await client.indices.exists({index: 'events'})
  if (idxExists.body) return
  
  await client.indices.create({
    index: `events-${Date.now().toString()}`,
    body: {
      mappings: {
        properties: {
          name: { type: 'keyword' },
          briefDescription: { type: 'text' },
          longDescription: { type: 'text' },
          eventDate: { type: 'date' },
          userId: { type: 'text' },
          email: { type: 'text' },
          displayName: { type: 'text' },
          addressId: { type: 'text' },
          addr1: { type: 'text' },
          addr2: { type: 'text' },
          city: { type: 'keyword' },
          state: { type: 'keyword' },
          postal: { type: 'text' },
          country: { type: 'keyword' },
          location: { type: 'geo_point' }
        }
      },
      aliases: {
        events: {}
      }
    }
  })
}

export const updateEventIndex = async(event: Event) => {
  console.log(`Indexing Event ${event.id}`)
  
  const user = await event.createdBy
  const address = await event.address
  await client.index({
    index: 'events',
    id: event.id,
    body: {
      name: event.name,
      briefDescription: event.briefDescription,
      longDescription: event.longDescription,
      eventDate: event.eventDate,
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      addressId: address.id,
      addr1: address.addr1,
      addr2: address.addr2,
      city: address.city,
      state: address.state,
      postal: address.postal,
      country: address.country,
      location: [address.lat, address.lng]
    }
  })
}