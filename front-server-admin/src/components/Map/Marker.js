const TMap = window.TMap

class Marker extends TMap.DOMOverlay {
  onInit(options) {
    this.position = options.position
    this.offset = options.offset || [0, 0]
    this.element = options.element
  }
  createDOM() {
    this.mydom = document.createElement('div')
    this.mydom.appendChild(this.element)
    this.mydom.style.cssText = 'position:absolute;top:0px;left:0px;'
    return this.mydom
  }
  setPosition(position) {
    this.position = position
    this.updateDOM()
  }
  updateDOM() {
    if (!this.map) {
      return
    }
    const pixel = this.map.projectToContainer(this.position)
    const left = this.offset[0] + pixel.getX() - this.dom.clientWidth / 2 + 'px' // 本例水平居中
    const top = this.offset[1] + pixel.getY() - this.dom.clientHeight / 2 + 'px'
    this.dom.style.transform = `translate3d(${left}, ${top}, 0px)`
  }
}

export default Marker
