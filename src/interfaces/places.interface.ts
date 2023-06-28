export interface PlacesResponse {
    next_page_token?: string
    results: Place[]
    status: string
}

export interface Place {
    name: string,
    place_id: string,
    vicinity: string,
    types: string[],
}