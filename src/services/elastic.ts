import {Client} from '@elastic/elasticsearch'

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