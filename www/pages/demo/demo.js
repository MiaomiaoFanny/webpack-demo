import '../../css/common.css'
import './demo.css'

const {log:ll, dir, error, table} = console;
function clipboard(action, text) {
  let res = false
  const input = document.createElement('input')
  document.body.append(input)
  input.setAttribute('value', text)
  input.select();
  if(document.execCommand(action)) {
    document.execCommand(action)
    res = true
  }
  document.body.removeChild(input)
  return res;
}

function activeScale(ele) {
  ele.classList.add('copied')
  setTimeout(() => ele.classList.add('copied-active'))
  ele.addEventListener('transitionend', () => {
    ele.classList.remove('copied', 'copied-active')
  })
}

function colorToHex(rgbColor) {
  let hexColor = '#'
  if(!rgbColor || rgbColor.indexOf('#') === 0) {
    hexColor = rgbColor
    return hexColor
  }
  let arr = rgbColor.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').replace(/ /g, '').split(',')
  return hexColor + parseInt(arr[0]).toString(16) + parseInt(arr[1]).toString(16) + parseInt(arr[2]).toString(16)
}

function copyBgColor(ele, index){
  ele.addEventListener('click', () => {
    clipboard('copy', colorToHex(getComputedStyle(ele).backgroundColor))
    activeScale(ele)
  })
}

const colorBox = document.querySelectorAll('#demo-box .box div')
const buttons = document.querySelectorAll('button')
const inputButton = document.querySelectorAll('input[type=button], input[type=submit]')
const checkbox = document.querySelectorAll('input[type=checkbox]')
const radio = document.querySelectorAll('input[type=radio]')
const selects = document.querySelectorAll('select')
const inputs = document.querySelectorAll('input')
const hhs = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
Array.from(colorBox).concat(Array.from(buttons), Array.from(inputButton)).forEach(copyBgColor)
Array.from(checkbox).concat(Array.from(radio), Array.from(inputButton), Array.from(inputs), Array.from(selects))
  .forEach((ele, index) => {
    ele.addEventListener('click', () => {
      ll('click ele:', [ele.value], 'checked', ele.checked, ele.tabindex, ele)
    })
  })