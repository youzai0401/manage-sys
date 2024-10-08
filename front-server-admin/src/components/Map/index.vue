<template>
  <div style="position: relative;height: 100%;width: 100%;">
    <div id="map" />
  </div>
</template>

<script>
import center from '@turf/center'
import destination from '@turf/destination'
import bearing from '@turf/bearing'
import distance from '@turf/distance'
import InfoWindow from '@/components/Map/InfoWindow'
import Marker from '@/components/Map/Marker'

const TMap = window.TMap
let map = null

export default {
  props: {
    bounds: {
      type: Array,
      default: () => []
    },
    handPicture: {}
  },
  data() {
    this.imgLayer = null
    this.boundsMarker = []
    this.centerMarker = null
    return {
      centerCoord: '',
      path: ''
    }
  },
  mounted() {
    map = new TMap.Map('map', {
      zoom: 20,
      center: new TMap.LatLng(31.31418023830836, 120.59115476812592)
    })
    this.$nextTick(() => {
      this.$emit('load')
    })
  },
  methods: {
    showImg(bounds, img, options = {}) {
      const { visible = true, flyTo = true } = options
      if (bounds.some(p => p.length !== 2)) return
      const centered = center(createGeojson([
        bounds[0].slice().reverse().map(n => Number(n)),
        bounds[1].slice().reverse().map(n => Number(n))
      ]))
      const imageSW = new TMap.LatLng(bounds[0][0], bounds[0][1])
      const imageNE = new TMap.LatLng(bounds[1][0], bounds[1][1])
      const imageSW_extend = destination([bounds[0][1], bounds[0][0]], 0.2, -135).geometry.coordinates
      const imageNE_extend = destination([bounds[1][1], bounds[1][0]], 0.2, 45).geometry.coordinates
      const imageLatLngBounds = new TMap.LatLngBounds(imageSW, imageNE)
      const imageLatLngBounds_extend = new TMap.LatLngBounds(new TMap.LatLng(imageSW_extend[1], imageSW_extend[0]), new TMap.LatLng(imageNE_extend[1], imageNE_extend[0]))
      map.setBoundary(imageLatLngBounds_extend)
      if (flyTo) {
        map.easeTo({
          zoom: 20,
          center: new TMap.LatLng(centered.geometry.coordinates[1], centered.geometry.coordinates[0])
        }, { duration: 1000 })
      }
      this.boundsMarker = bounds.map((lonlat, index) => {
        if (this.boundsMarker.length === 2) {
          this.boundsMarker[index].setPosition(new TMap.LatLng(lonlat[0], lonlat[1]))
          return this.boundsMarker[index]
        }
        const dom = document.createElement('div')
        dom.innerHTML = '+'
        dom.style.cssText = 'font-size:26px;color:red;'
        return new Marker({
          map,
          position: new TMap.LatLng(lonlat[0], lonlat[1]),
          element: dom
        })
      })

      if (!this.centerMarker) {
        const centerDom = document.createElement('div')
        centerDom.innerHTML = '+'
        centerDom.style.cssText = 'font-size:26px;color:red;'
        this.centerMarker = new Marker({
          map,
          position: new TMap.LatLng(centered.geometry.coordinates[1], centered.geometry.coordinates[0]),
          element: centerDom
        })
      } else this.centerMarker.setPosition(new TMap.LatLng(centered.geometry.coordinates[1], centered.geometry.coordinates[0]))

      if (!this.imgLayer) {
        this.imgLayer = new TMap.ImageGroundLayer({
          bounds: imageLatLngBounds,
          src: img,
          map: map
        })
      } else {
        this.imgLayer.setSrc(img)
      }
      console.log(visible)
      this.imgLayer.setVisible(visible)
    },
    addPoi({ centerCoord, path }) {
      const centered = center(createGeojson([
        this.bounds[0].slice().reverse().map(n => Number(n)),
        this.bounds[1].slice().reverse().map(n => Number(n))
      ]))
      const centerPoint = centerCoord || centered.geometry.coordinates.reverse() || [31.31549002613189, 120.59239808239599]
      this.$nextTick(() => {
        map.easeTo({
          zoom: 20,
          center: new TMap.LatLng(centerPoint[0], centerPoint[1])
        }, { duration: 1000 })
      })
      this.centerCoord = [...centerPoint]
      this.path = path ? path.map(p => {
        return new TMap.LatLng(p[0], p[1])
      }) : createPath(centerPoint)
      let myInfoWindow = null
      if (!centerCoord) {
        myInfoWindow = new InfoWindow({
          map: map,
          position: new TMap.LatLng(centerPoint[0], centerPoint[1]),
          emitter: this
        })
      }
      const polygon = new TMap.MultiPolygon({
        map,
        styles: {
          highlight: new TMap.PolygonStyle({
            color: 'rgba(255, 255, 0, 0.6)'
          })
        },
        geometries: [
          {
            paths: this.path
          }
        ]
      })
      const marker = new TMap.MultiMarker({
        id: 'poi',
        map: map,
        styles: {
          'default': new TMap.MarkerStyle({
            offset: { x: 0, y: -40 }
          }),
          'highlight': new TMap.MarkerStyle({
            'src': 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/marker-pink.png'
          })
        },
        geometries: [{
          styleId: 'default',
          'position': new TMap.LatLng(centerPoint[0], centerPoint[1]),
          content: centerPoint.toString()
        }]
      })
      const editor = new TMap.tools.GeometryEditor({
        map, // 编辑器绑定的地图对象
        overlayList: [{
          overlay: marker, // 可编辑图层
          id: 'marker',
          selectedStyleId: 'highlight'
        },
        {
          overlay: polygon, // 可编辑图层
          id: 'polygon',
          selectedStyleId: 'highlight'
        }],
        actionMode: TMap.tools.constants.EDITOR_ACTION.INTERACT,
        activeOverlayId: '', // 激活图层
        selectable: true
      })
      editor.on('select', () => {
        if (editor.getActiveOverlay().id === 'polygon') {
          const svgs = document.querySelectorAll("svg[baseProfile='full']")
          svgs.forEach((el, index) => {
            if ([2, 4, 6, 8].includes(index)) el.style = 'display:none'
          })
        }
      })
      editor.on('adjust_complete', (geometry) => {
        if (geometry?.paths) {
          this.path = geometry.paths
        } else {
          const from = this.centerCoord.slice().reverse()
          const to = [geometry.position.lng, geometry.position.lat]
          const bear = bearing(from, to)
          const dis = distance(from, to)
          console.log(bear, dis)
          this.centerCoord = [geometry.position.lat, geometry.position.lng]
          marker.setGeometries([{
            ...geometry,
            content: this.centerCoord.toString()
          }])
          this.path = this.path.map(p => {
            const getNewLonLat = destination([p.lng, p.lat], dis, bear)
            p.lng = getNewLonLat.geometry.coordinates[0]
            p.lat = getNewLonLat.geometry.coordinates[1]
            return p
          })
          polygon.setGeometries([
            {
              paths: this.path
            }
          ])
          if (myInfoWindow)myInfoWindow.updatePosition(new TMap.LatLng(this.centerCoord[0], this.centerCoord[1]))
        }
        if (centerCoord) this.$emit('updatePoi', { type: 'update', data: { path: this.path, centerCoord: this.centerCoord }})
      })
      this.editor = editor
      this.myInfoWindow = myInfoWindow
      this.marker = marker
      this.polygon = polygon
      this.$on('fromWindow', name => {
        this.poiDisable()
        this.$emit('savePoi', {
          name,
          path: this.path,
          centerCoord: this.centerCoord
        })
      })
      this.$on('fromWindowClose', () => {
        this.$emit('cancelSavePoi')
        this.poiDisable()
      })
    },
    poiDisable() {
      this.editor.destroy()
      if (this.myInfoWindow) this.myInfoWindow.destroy()
      this.marker.setMap(null)
      this.polygon.setMap(null)
      this.$off('fromWindow')
      this.$off('fromWindowClose');
      ['editor', 'marker', 'polygon', 'myInfoWindow'].forEach(key => {
        this[key] = null
      })
    },
    showMarker(poi = []) {
      if (this.markers?.length) this.markers.forEach(m => m.destroy())
      this.markers = []
      poi.forEach(p => {
        const center = p.centralPointCoordinate.split(',')
        const dom = document.createElement('div')
        dom.style = 'width:60px;display:flex; align-items: center;flex-direction: column;'
        dom.innerHTML = `<img style="width: 30px" src="${process.env.VUE_APP_BASE_PHOTO_URL}${p.image}" style="width: 80%"><span style="font-size: 12px">${p.name}</span>`
        this.markers.push(new Marker({
          map,
          offset: [0, -20],
          position: new TMap.LatLng(center[0], center[1]),
          element: dom
        }))
      })
    }
  }
}

function createGeojson(polygon) {
  return {
    'type': 'FeatureCollection',
    'features': [{
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          polygon
        ]
      }
    }]
  }
}

function createPath(centerPoint) {
  const centerCoord = centerPoint.slice().reverse()
  const bufferLength = 0.005
  const buffer = [
    destination(centerCoord, bufferLength, -45),
    destination(centerCoord, bufferLength, 45),
    destination(centerCoord, bufferLength, 135),
    destination(centerCoord, bufferLength, -135)
  ]
  return [
    new TMap.LatLng(buffer[0].geometry.coordinates[1], buffer[0].geometry.coordinates[0]),
    new TMap.LatLng(buffer[1].geometry.coordinates[1], buffer[1].geometry.coordinates[0]),
    new TMap.LatLng(buffer[2].geometry.coordinates[1], buffer[2].geometry.coordinates[0]),
    new TMap.LatLng(buffer[3].geometry.coordinates[1], buffer[3].geometry.coordinates[0])
  ]
}
</script>

<style scoped>
#map {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
