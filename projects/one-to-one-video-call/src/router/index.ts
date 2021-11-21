import Local from '@/pages/local'
import Remote from '@/pages/remote'
import App from '@/App'
import { RouteConfig } from 'react-router-config'

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: App,
    exact: true
  },
  {
    path: '/local',
    component: Local
  },
  {
    path: '/remote',
    component: Remote
  }
]