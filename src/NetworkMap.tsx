import { useEffect, useRef } from 'react'
import { Map, Marker, NavigationControl, setWorkerUrl, type GeoJSONSource, type MapGeoJSONFeature } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Branch, Competitor, NetworkMetrics } from './types'

setWorkerUrl(mapWorkerUrl)

const SOURCE_ID = 'bedashing-branches'
const LAYER_ID = 'bedashing-branch-points'
const COMPETITOR_SOURCE_ID = 'competitor-points'
const COMPETITOR_LAYER_ID = 'competitor-points'
const WHITESPACE_SOURCE_ID = 'whitespace-cells'
const WHITESPACE_LAYER_ID = 'whitespace-cells'
const WHITESPACE_OUTLINE_LAYER_ID = 'whitespace-cells-outline'
const SELECTED_WHITESPACE_OUTLINE_LAYER_ID = 'selected-whitespace-cell-outline'
const RADIUS_SOURCE_ID = 'service-radii'
const RADIUS_FILL_LAYER_ID = 'service-radii-fill'
const RADIUS_OUTLINE_LAYER_ID = 'service-radii-outline'

const mapStyle = 'https://tiles.openfreemap.org/styles/liberty'

function preferEnglishLabels(map: Map) {
  const englishFirstName: any = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']]
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type === 'symbol' && layer.layout?.['text-field']) map.setLayoutProperty(layer.id, 'text-field', englishFirstName)
  }
}

function toFeatureCollection(branches: Branch[]) {
  return {
    type: 'FeatureCollection' as const,
    features: branches
      .filter((branch) => branch.latitude !== null && branch.longitude !== null)
      .map((branch) => ({
        type: 'Feature' as const,
        properties: { branch_id: branch.branch_id, name: branch.name, emirate: branch.emirate, status: branch.status },
        geometry: { type: 'Point' as const, coordinates: [branch.longitude!, branch.latitude!] },
      })),
  }
}

function competitorFeatureCollection(competitors: Competitor[]) {
  return { type: 'FeatureCollection' as const, features: competitors.filter((item) => item.latitude !== null && item.longitude !== null).map((item) => ({ type: 'Feature' as const, properties: { competitor_id: item.competitor_id, name: item.name, taxonomy_class: item.taxonomy_class }, geometry: { type: 'Point' as const, coordinates: [item.longitude!, item.latitude!] } })) }
}
function whitespaceFeatureCollection(candidates: any[]) {
  return {
    type: 'FeatureCollection' as const,
    features: candidates.map((item) => ({
      type: 'Feature' as const,
      properties: { cell_id: item.cell_id, label: item.label },
      geometry: { type: 'Polygon' as const, coordinates: [item.boundary] },
    })),
  }
}

function geodesicCircle(longitude: number, latitude: number, radiusKm: number) {
  const earthRadiusKm = 6371.0088
  const angularDistance = radiusKm / earthRadiusKm
  const latitudeRadians = latitude * Math.PI / 180
  const longitudeRadians = longitude * Math.PI / 180
  const coordinates: [number, number][] = []
  for (let step = 0; step <= 96; step += 1) {
    const bearing = 2 * Math.PI * step / 96
    const destinationLatitude = Math.asin(
      Math.sin(latitudeRadians) * Math.cos(angularDistance)
      + Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearing),
    )
    const destinationLongitude = longitudeRadians + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitudeRadians),
      Math.cos(angularDistance) - Math.sin(latitudeRadians) * Math.sin(destinationLatitude),
    )
    coordinates.push([destinationLongitude * 180 / Math.PI, destinationLatitude * 180 / Math.PI])
  }
  return coordinates
}

function radiusFeatureCollection(allBranches: Branch[], metrics: NetworkMetrics, selectedBranchId: string | null, radiusKm: number) {
  if (!selectedBranchId) return { type: 'FeatureCollection' as const, features: [] }
  const overlappingIds = new Set(
    metrics.pairwise_overlaps
      .filter((overlap) => overlap.radius_km === radiusKm && (overlap.branch_a_id === selectedBranchId || overlap.branch_b_id === selectedBranchId))
      .map((overlap) => overlap.branch_a_id === selectedBranchId ? overlap.branch_b_id : overlap.branch_a_id),
  )
  const includedIds = new Set([selectedBranchId, ...overlappingIds])
  return {
    type: 'FeatureCollection' as const,
    features: allBranches
      .filter((branch) => includedIds.has(branch.branch_id) && !branch.status.includes('permanently_closed') && branch.latitude !== null && branch.longitude !== null)
      .map((branch) => ({
        type: 'Feature' as const,
        properties: {
          branch_id: branch.branch_id,
          name: branch.name,
          role: branch.branch_id === selectedBranchId ? 'selected' : 'overlapping',
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [geodesicCircle(branch.longitude!, branch.latitude!, radiusKm)],
        },
      })),
  }
}

interface NetworkMapProps {
  branches: Branch[]
  selectedBranchId: string | null
  competitors: Competitor[]
  showCompetitors: boolean
  candidates: any[]
  selectedCandidateId: string | null
  showCandidates: boolean
  allBranches: Branch[]
  networkMetrics: NetworkMetrics
  showServiceRadii: boolean
  radiusKm: number
  onSelectCandidate: (candidate: any) => void
  onSelect: (branchId: string) => void
}

export function NetworkMap({ branches, selectedBranchId, competitors, showCompetitors, candidates, selectedCandidateId, showCandidates, allBranches, networkMetrics, showServiceRadii, radiusKm, onSelect, onSelectCandidate }: NetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const selectedMarkerRef = useRef<Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new Map({
      container: containerRef.current,
      style: mapStyle,
      center: [55.12, 24.75],
      zoom: 7.25,
      maxBounds: [[51.5, 21.5], [57.7, 27]],
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')
    const selectedMarkerElement = document.createElement('div')
    selectedMarkerElement.className = 'selected-branch-marker'
    selectedMarkerElement.setAttribute('aria-hidden', 'true')
    selectedMarkerElement.style.display = 'none'
    selectedMarkerRef.current = new Marker({ element: selectedMarkerElement, anchor: 'center' }).setLngLat([0, 0]).addTo(map)

    map.on('load', () => {
      preferEnglishLabels(map)
      map.addSource(SOURCE_ID, { type: 'geojson', data: toFeatureCollection(branches) })
      map.addSource(COMPETITOR_SOURCE_ID, { type: 'geojson', data: competitorFeatureCollection(competitors) })
      map.addSource(WHITESPACE_SOURCE_ID, { type: 'geojson', data: whitespaceFeatureCollection(candidates) })
      map.addSource(RADIUS_SOURCE_ID, { type: 'geojson', data: radiusFeatureCollection(allBranches, networkMetrics, selectedBranchId, radiusKm) })
      map.addLayer({ id: WHITESPACE_LAYER_ID, type: 'fill', source: WHITESPACE_SOURCE_ID, paint: { 'fill-color': ['match',['get','label'],'PRIORITIZE_RESEARCH','#0072b2','WATCH_RESEARCH','#e69f00','DEPRIORITIZE_RESEARCH','#b24a91','#59636e'], 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 6, .58, 10, .68, 14, .76] }, layout: { visibility: showCandidates ? 'visible' : 'none' } })
      map.addLayer({ id: WHITESPACE_OUTLINE_LAYER_ID, type: 'line', source: WHITESPACE_SOURCE_ID, paint: { 'line-color': '#fffaf4', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, .35, 12, 1], 'line-opacity': .8 }, layout: { visibility: showCandidates ? 'visible' : 'none' } })
      map.addLayer({ id: SELECTED_WHITESPACE_OUTLINE_LAYER_ID, type: 'line', source: WHITESPACE_SOURCE_ID, filter: ['==', ['get', 'cell_id'], selectedCandidateId ?? ''], paint: { 'line-color': '#172b35', 'line-width': 3, 'line-opacity': 1 }, layout: { visibility: showCandidates ? 'visible' : 'none' } })
      map.on('click', WHITESPACE_LAYER_ID, (event) => { const feature=event.features?.[0]; const candidate=candidates.find((item) => item.cell_id===feature?.properties?.cell_id); if(candidate) onSelectCandidate(candidate) })
      map.on('mouseenter', WHITESPACE_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', WHITESPACE_LAYER_ID, () => { map.getCanvas().style.cursor = '' })
      map.addLayer({ id: RADIUS_FILL_LAYER_ID, type: 'fill', source: RADIUS_SOURCE_ID, paint: { 'fill-color': ['match', ['get', 'role'], 'selected', '#e09a3e', '#2f7885'], 'fill-opacity': ['match', ['get', 'role'], 'selected', .22, .13] }, layout: { visibility: showServiceRadii ? 'visible' : 'none' } })
      map.addLayer({ id: RADIUS_OUTLINE_LAYER_ID, type: 'line', source: RADIUS_SOURCE_ID, paint: { 'line-color': ['match', ['get', 'role'], 'selected', '#b46616', '#23616b'], 'line-width': ['match', ['get', 'role'], 'selected', 2.5, 1.5], 'line-dasharray': [3, 2] }, layout: { visibility: showServiceRadii ? 'visible' : 'none' } })
      map.addLayer({ id: COMPETITOR_LAYER_ID, type: 'circle', source: COMPETITOR_SOURCE_ID, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 10, 5, 14, 7], 'circle-color': '#2f6f7e', 'circle-stroke-color': '#fffaf4', 'circle-stroke-width': 1.5, 'circle-opacity': 0.9 }, layout: { visibility: showCompetitors ? 'visible' : 'none' } })
      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 5, 10, 8, 14, 11],
          'circle-color': ['match', ['get', 'status'], 'user_confirmed_permanently_closed', '#d7191c', '#8f3d66'],
          'circle-stroke-color': ['match', ['get', 'status'], 'user_confirmed_permanently_closed', '#710000', '#fffaf4'],
          'circle-stroke-width': 2,
          'circle-opacity': 0.93,
        },
      })
      map.on('click', LAYER_ID, (event) => {
        const feature = event.features?.[0] as MapGeoJSONFeature | undefined
        const id = feature?.properties?.branch_id
        if (typeof id === 'string') onSelect(id)
      })
      map.on('mouseenter', LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', LAYER_ID, () => { map.getCanvas().style.cursor = '' })
    })

    return () => {
      selectedMarkerRef.current?.remove()
      selectedMarkerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [branches, candidates, onSelect, onSelectCandidate])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getLayer(COMPETITOR_LAYER_ID)) return
    map.setLayoutProperty(COMPETITOR_LAYER_ID, 'visibility', showCompetitors ? 'visible' : 'none')
  }, [showCompetitors])

  useEffect(() => {
    const map=mapRef.current
    if (!map || !map.getLayer(WHITESPACE_LAYER_ID)) return
    const visibility=showCandidates?'visible':'none'
    map.setLayoutProperty(WHITESPACE_LAYER_ID,'visibility',visibility)
    map.setLayoutProperty(WHITESPACE_OUTLINE_LAYER_ID,'visibility',visibility)
    map.setLayoutProperty(SELECTED_WHITESPACE_OUTLINE_LAYER_ID,'visibility',visibility)
  }, [showCandidates])

  useEffect(() => {
    const map=mapRef.current
    if (!map || !map.getLayer(SELECTED_WHITESPACE_OUTLINE_LAYER_ID)) return
    map.setFilter(SELECTED_WHITESPACE_OUTLINE_LAYER_ID, ['==', ['get', 'cell_id'], selectedCandidateId ?? ''])
  }, [selectedCandidateId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getLayer(RADIUS_FILL_LAYER_ID)) return
    const visibility = showServiceRadii ? 'visible' : 'none'
    map.setLayoutProperty(RADIUS_FILL_LAYER_ID, 'visibility', visibility)
    map.setLayoutProperty(RADIUS_OUTLINE_LAYER_ID, 'visibility', visibility)
  }, [showServiceRadii])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const source = map.getSource(RADIUS_SOURCE_ID) as GeoJSONSource | undefined
    source?.setData(radiusFeatureCollection(allBranches, networkMetrics, selectedBranchId, radiusKm))
  }, [allBranches, networkMetrics, radiusKm, selectedBranchId])

  useEffect(() => {
    const map = mapRef.current
    const selectedMarker = selectedMarkerRef.current
    if (!map || !selectedMarker) return
    const branch = allBranches.find((item) => item.branch_id === selectedBranchId)
    const markerElement = selectedMarker.getElement()
    if (!branch || branch.status.includes('permanently_closed') || branch.latitude === null || branch.longitude === null) {
      markerElement.style.display = 'none'
      markerElement.removeAttribute('data-branch-id')
      return
    }
    markerElement.style.display = 'block'
    markerElement.dataset.branchId = branch.branch_id
    selectedMarker.setLngLat([branch.longitude, branch.latitude])
    const radiusZoom = radiusKm === 1 ? 12.5 : radiusKm === 3 ? 11 : 10.25
    map.flyTo({ center: [branch.longitude, branch.latitude], zoom: showServiceRadii ? radiusZoom : Math.max(map.getZoom(), 11), duration: 700, essential: true })
  }, [allBranches, radiusKm, selectedBranchId, showServiceRadii])

  return <div className="map" aria-label="Interactive map of the Bedashing UAE network" ref={containerRef} />
}
