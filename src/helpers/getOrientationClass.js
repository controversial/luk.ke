export default function getOrientationClass(orientation) {
  return ({
    left: 'panel-on-left',
    right: 'panel-on-right',
    full: 'panel-full',
  })[orientation];
}
