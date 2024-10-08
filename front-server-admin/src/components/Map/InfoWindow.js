const TMap = window.TMap

class InfoWindow extends TMap.DOMOverlay {
  onInit(options) {
    this.position = options.position
    this.emitter = options.emitter
  }
  createDOM() {
    this.mydom = document.createElement('div')
    const input = document.createElement('input')
    input.placeholder = '输入名称'
    const button = document.createElement('button')
    button.innerHTML = '确认'
    const button1 = document.createElement('button')
    button1.innerHTML = '取消'
    this.mydom.appendChild(input)
    this.mydom.appendChild(button)
    this.mydom.appendChild(button1)
    button.addEventListener('click', () => {
      if (input.value !== '') this.emitter.$emit('fromWindow', input.value)
    })
    button1.addEventListener('click', () => {
      this.emitter.$emit('fromWindowClose')
    })
    // 设置DOM样式
    this.mydom.style.cssText = 'font-size:12px;position:absolute;top:0px;left:0px;'
    return this.mydom
  }
  updatePosition(position) {
    this.position = position
    this.updateDOM()
  }
  updateDOM() {
    if (!this.map) {
      return
    }

    // 经纬度坐标转容器像素坐标
    const pixel = this.map.projectToContainer(this.position)

    // 默认使用DOM左上角作为坐标焦点进行绘制（左上对齐）
    // 如想以DOM中心点（横向&垂直居中）或其它位置为焦点，可结合this.dom.clientWidth和this.dom.clientHeight自行计算
    const left = pixel.getX() - this.dom.clientWidth / 2 + 'px' // 本例水平居中
    const top = pixel.getY() + 50 + 'px'

    // 将平面坐标转为三维空间坐标
    this.dom.style.transform = `translate3d(${left}, ${top}, 0px)`
  }
}

export default InfoWindow
