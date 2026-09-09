import { useEffect, useRef } from 'react'
import { Map, NavigationControl, setWorkerUrl, type MapGeoJSONFeature } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Branch } from './types'

setWorkerUrl(mapWorkerUrl)

const SOURCE_ID = 'bedashing-branches'
const LAYER_ID = 'bedashing-branch-points'
const SELECTED_LAYER_ID = 'bedashing-selected-branch'

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
        properties: { branch_id: branch.branch_id, name: branch.name, emirate: branch.emirate },
        geometry: { type: 'Point' as const, coordinates: [branch.longitude!, branch.latitude!] },
      })),
  }
}

interface NetworkMapProps {
  branches: Branch[]
  selectedBranchId: string | null
  onSelect: (branchId: string) => void
}

export function NetworkMap({ branches, selectedBranchId, onSelect }: NetworkMapProps) {
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
      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 5, 10, 8, 14, 11],
          'circle-color': '#8f3d66',
          'circle-stroke-color': '#fffaf4',
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
  }, [branches, onSelect])

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
