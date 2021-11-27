import Local from '@/pages/local'
import Remote1 from '@/pages/remote/remote1'
import Remote2 from '@/pages/remote/remote2'
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
    path: '/remote1',
    component: Remote1
  },
  {
    path: '/remote2',
    component: Remote2
  }
]