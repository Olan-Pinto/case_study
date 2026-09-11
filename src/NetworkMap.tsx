import { useEffect, useRef } from 'react'
import { Map, NavigationControl, setWorkerUrl, type MapGeoJSONFeature } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Branch, Competitor } from './types'

setWorkerUrl(mapWorkerUrl)

const SOURCE_ID = 'bedashing-branches'
const LAYER_ID = 'bedashing-branch-points'
const SELECTED_LAYER_ID = 'bedashing-selected-branch'
const COMPETITOR_SOURCE_ID = 'competitor-points'
const COMPETITOR_LAYER_ID = 'competitor-points'
const WHITESPACE_SOURCE_ID = 'whitespace-cells'
const WHITESPACE_LAYER_ID = 'whitespace-cells'

const mapStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#f5f2ed' } },
    { id: 'osm', type: 'raster' as const, source: 'osm', minzoom: 0, maxzoom: 19, paint: { 'raster-opacity': 0.78 } },
  ],
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
function whitespaceFeatureCollection(candidates: any[]) { return { type: 'FeatureCollection' as const, features: candidates.map((item) => ({ type: 'Feature' as const, properties: { cell_id: item.cell_id, label: item.label }, geometry: { type: 'Point' as const, coordinates: [item.longitude, item.latitude] } })) } }

interface NetworkMapProps {
  branches: Branch[]
  selectedBranchId: string | null
  competitors: Competitor[]
  showCompetitors: boolean
  candidates: any[]
  showCandidates: boolean
  onSelectCandidate: (candidate: any) => void
  onSelect: (branchId: string) => void
}

export function NetworkMap({ branches, selectedBranchId, competitors, showCompetitors, candidates, showCandidates, onSelect, onSelectCandidate }: NetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

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

    map.on('load', () => {
      map.addSource(SOURCE_ID, { type: 'geojson', data: toFeatureCollection(branches) })
      map.addSource(COMPETITOR_SOURCE_ID, { type: 'geojson', data: competitorFeatureCollection(competitors) })
      map.addSource(WHITESPACE_SOURCE_ID, { type: 'geojson', data: whitespaceFeatureCollection(candidates) })
      map.addLayer({ id: WHITESPACE_LAYER_ID, type: 'circle', source: WHITESPACE_SOURCE_ID, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3.5, 10, 5, 14, 7], 'circle-color': ['match',['get','label'],'WATCH_RESEARCH','#e0a13b','SKIP_RESEARCH','#a94b4b','#8796a5'], 'circle-stroke-color': '#fffaf4', 'circle-stroke-width': .5, 'circle-opacity': .65 }, layout: { visibility: showCandidates ? 'visible' : 'none' } })
      map.on('click', WHITESPACE_LAYER_ID, (event) => { const feature=event.features?.[0]; const candidate=candidates.find((item) => item.cell_id===feature?.properties?.cell_id); if(candidate) onSelectCandidate(candidate) })
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
      map.addLayer({
        id: SELECTED_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['get', 'branch_id'], ''],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 9, 10, 13, 14, 16],
          'circle-color': '#f2b86e',
          'circle-stroke-color': '#57223d',
          'circle-stroke-width': 3,
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
      map.remove()
      mapRef.current = null
    }
  }, [branches, candidates, onSelect, onSelectCandidate])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getLayer(COMPETITOR_LAYER_ID)) return
    map.setLayoutProperty(COMPETITOR_LAYER_ID, 'visibility', showCompetitors ? 'visible' : 'none')
  }, [showCompetitors])

  useEffect(() => { const map=mapRef.current; if(map?.isStyleLoaded()&&map.getLayer(WHITESPACE_LAYER_ID)) map.setLayoutProperty(WHITESPACE_LAYER_ID,'visibility',showCandidates?'visible':'none') }, [showCandidates])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getLayer(SELECTED_LAYER_ID)) return
    map.setFilter(SELECTED_LAYER_ID, ['==', ['get', 'branch_id'], selectedBranchId ?? ''])
    const branch = branches.find((item) => item.branch_id === selectedBranchId)
    if (!branch || branch.latitude === null || branch.longitude === null) return
    map.flyTo({ center: [branch.longitude, branch.latitude], zoom: Math.max(map.getZoom(), 11), duration: 700, essential: true })
  }, [branches, selectedBranchId])

  return <div className="map" aria-label="Interactive map of the Bedashing UAE network" ref={containerRef} />
}
