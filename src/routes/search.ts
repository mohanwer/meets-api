import app, {Router, RouterOptions} from 'express'
import {searchEvents} from '../services/elastic'

export interface SearchRequest {
  name?: string
  location?: {
    lat: number,
    lng: number,
    distance: string
  }
}

const searchRouter = Router()

searchRouter.post('/search/events', async(req, res) => {
  const searchParams = req.body
  const searchResults = await searchEvents(searchParams)
  res.send(searchResults)
})


export {searchRouter}