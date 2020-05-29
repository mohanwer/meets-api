import * as https from 'https'
import * as querystring from 'querystring'
import { AddressInput } from '../resolvers/event/event-input';
import {ParsedUrlQueryInput} from 'querystring';

export interface AddressToGeoCode extends AddressInput {
  lat?: number
  lng?: number
}

interface AddressRequest extends ParsedUrlQueryInput {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  api_key: string
  limit: number
}

interface AddressResponse {
  input: {
    address_components: AddressComponents,
    formatted_address: string
  },
  results: [{
    address_components: AddressComponents
    formatted_address: string
    location: Location
    accuracy: number
    acurracy_type: string
    source: string
  }]
}

interface AddressComponents {
  number: string
  predirectional: string
  formatted_stree: string
  county: string
  street: string
  suffix: string
  city: string
  state: string
  zip: string
  country: string
}

interface Location {
  lat: number
  lng: number
}

const GEO_CODE_API_ADDR = 'https://api.geocod.io/v1.6/'
const GEO_CODE_API_KEY = process.env.GEO_CODIO

export const geocode = async(address: AddressToGeoCode) => {
  const queryParams: AddressRequest = {
    street: address.addr1,
    city: address.city,
    state: address.state,
    postal_code: address.postal,
    country: address.country,
    api_key: process.env.GEO_CODIO,
    limit: 1
  }
  const qString = querystring.stringify(queryParams)
  const apiGetUrl = `${GEO_CODE_API_ADDR}geocode?${qString}&api_key=${GEO_CODE_API_KEY}`
  const geoCodedResult: AddressResponse = await new Promise((resolve, reject) => {
    https.get(apiGetUrl, (res) => {
      let respData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        respData += chunk
      })
      res.on('end', () => {
        resolve(JSON.parse(respData))
      })
      res.on('error', (err) => {
        reject(err)
      })
    })
  }) 
  
  address.lng = geoCodedResult.results[0].location.lng
  address.lat = geoCodedResult.results[0].location.lat
}

export const geocodeAddrStr = async(address: string): Promise<{lat: number, lng: number}> => {
  const qString = querystring.stringify({q: address, limit: 1})
  const apiGetUrl = `${GEO_CODE_API_ADDR}geocode?${qString}&api_key=${GEO_CODE_API_KEY}`
  const geoCodedResult: AddressResponse = await new Promise((resolve, reject) => {
    https.get(apiGetUrl, (res) => {
      let respData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        respData += chunk
      })
      res.on('end', () => {
        resolve(JSON.parse(respData))
      })
      res.on('error', (err) => {
        reject(err)
      })
    })
  }) 
  const {lat, lng} = geoCodedResult.results[0].location
  return {lat, lng}
}