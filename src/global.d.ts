interface PaginationInfo {
  count: number
  pages: number
  next: null | string
  prev: null | string
}

interface CharacterOrigin {
  name: string
  url: string
}

interface CharacterLocation {
  name: string
  url: string
}

interface Character {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: string
  origin: CharacterOrigin
  location: CharacterLocation
  image: string
  episode: string[]
  url: string
  created: string
}

interface Location {}

interface Episode {}
