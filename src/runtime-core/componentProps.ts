/** 初始化 Props */
export function initProps(instance, rawProps) {
  const props = {}
  setFullProps(instance, rawProps, props)
  instance.props = props
}

function setFullProps(instance, rawProps, props) {
  Object.assign(props, rawProps)
}
