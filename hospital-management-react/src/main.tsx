import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store'

const renderApp = () => {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    throw new Error('React root element was not found.')
  }

  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp, { once: true })
} else {
  renderApp()
}
