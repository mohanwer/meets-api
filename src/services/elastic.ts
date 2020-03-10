import { Client } from '@elastic/elasticsearch'
import { Event } from '../entity/Event';
import { SearchRequest } from '../routes/search';

export interface GeoDistance {
  distance: string,
  "pin.location": {
    lat: number,
    lon: number,
  }
}

export const client = new Client({node: process.env.ELASTIC_HOST})

export const createEventIndex = async(force: boolean = false) => {
  //If index exists then stop index creation.
  const idxExists = await client.indices.exists({index: 'events'})
  if (idxExists.body && !force) return
  
  await client.indices.create({
    index: `events-${Date.now().toString()}`,
    body: {
      mappings: {
        properties: {
          name: { type: 'text' },
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
    },
    
  })
}

export const searchEvents = async(search?:SearchRequest) => {
  let query = {}

  if (search?.location)
    Object.assign(query, {filter: {geo_distance: {distance: search.location.distance, "pin.location": {lat: search.location.lat, lon: search.location.lng}}}})
  if (search?.name)
    Object.assign(query, {match: {name: {query: search.name}}})
  
  const results = await client.search({
    index: 'events',
    body: {
      query: query
    }
  })
  
  return results
}