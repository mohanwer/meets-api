import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch'
import { Event } from '../entity';
import { SearchRequest } from '../routes/search';

export const client = new Client({
  cloud: {
    id: `name:${process.env.ELASTIC_ID}`
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD
  }
})

export const createEventIndex = async(force: boolean = false): Promise<ApiResponse<any, any>> => {
  //If index exists then stop index creation.
  const idxExists = await client.indices.exists({index: 'events'})
  if (idxExists.body && !force) return
  const idxName = `events-${Date.now().toString()}`
  console.log(`Creating index: ${idxName}`)
  
  return await client.indices.create({
    index: idxName,
    body: {
      mappings: {
        properties: {
          id: {type: 'keyword'},
          name: { type: 'text', },
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
      },
      settings: {
        analysis: {
          analyzer: {
            rebuilt_standard: {
              tokenizer: "standard",
              filter: [
                "lowercase"
              ]
            }
          }
        }
      }
    }
  })
}

export const deleteEventIndex = async() =>
  await client.indices.delete({
    index: 'events*',
  }, (err, res) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Indexes have been deleted!');
    }
  });

export const clearEventIndex = async(): Promise<ApiResponse<any, any>> =>
  await client.deleteByQuery({
    index: 'events',
    body: {
      query: {
        match_all: {}
      }
    }
  });
  
export const updateEventInIndex = async(event: Event) => {
  console.log(`Indexing Event ${event.id}`)
  const eventDoc = await mapEventToElasticDoc(event)
  await client.index({
    index: 'events',
    id: event.id,
    body: eventDoc,
  })
}

export const searchEvents = async(search?:SearchRequest): Promise<ElasticSearchSlimResult[] | void> => {
  let query = {}

  if (search?.location)
    Object.assign(query, 
    { 
      filter: {
        geo_distance: {
          distance: search.location.distance, 
          "pin.location": {
            lat: search.location.lat, lon: search.location.lng
          }
        }
      }
    })

  if (search?.name)
    Object.assign(query, 
    {
      query_string: {
        query: search.name,
        fields: ['name', 'briefDescription']
      }
    })
  else
    Object.assign(query, { 'match_all': {} })

  const from = search?.from ?? 0
  const size = search?.size ?? 10

  const searchBody: RequestParams.Search = {
    index: 'events',
    body: {
      from: from,
      size: size,
      query: query
    }
  }

  const results: ApiResponse = await client.search(searchBody)

  if (results.body?.hits?.hits) {
    var searchResult: ElasticSearchSlimResult[] = results.body.hits.hits.map(hit => hit._source)
    return searchResult
  }
    
}

export const mapEventToElasticDoc = async(event: Event) => {
  const user = await event.createdBy
  const address = await event.address
  return {
    id: event.id,
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
    location: {
      lat: address.lat, 
      lon: address.lng
    }
  }
}

export interface ElasticSearchResult {
  id: string,
  name: string,
  addr1: string,
  addr2: string,
  briefDescription: string,
  longDescription: string,
  eventDate: Date,
  userId: string,
  email: string,
  displayName: string,
  city: string,
  state: string,
  postal: string,
  country: string,
  location: {
    lat: number,
    lon: number
  }
}

export interface ElasticSearchSlimResult extends Omit<ElasticSearchResult, 'email'> { }
