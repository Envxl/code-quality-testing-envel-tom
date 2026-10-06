import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'

global.IS_REACT_ACT_ENVIRONMENT = true

export const render = (element) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => root.render(element))

  return {
    container,
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    }
  }
}

export const change = (element, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    'value'
  ).set
  act(() => {
    setter.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

export const click = (element) => {
  act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })))
}

export const submit = (form) => {
  act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
}

export const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}
