/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as OverMijRouteImport } from './routes/over-mij'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as SpelRouteImport } from './routes/spel'
import { Route as BlogIndexRouteImport } from './routes/blog/index'
import { Route as BlogUsbCLabtafelMhsRouteImport } from './routes/blog/usb-c-labtafel-mhs'
import { Route as MarathonRouteImport } from './routes/marathon'
import { Route as PodcastRouteImport } from './routes/podcast'
import { Route as ProjectRouteImport } from './routes/project'
import { Route as ProjectenRouteImport } from './routes/projecten'
import { Route as ToolkitIndexRouteImport } from './routes/toolkit/index'
import { Route as ToolkitEenhedenRouteImport } from './routes/toolkit/eenheden'
import { Route as ToolkitBevestigersRouteImport } from './routes/toolkit/bevestigers'
import { Route as ToolkitCilinderRouteImport } from './routes/toolkit/cilinder'
import { Route as ToolkitBronnenRouteImport } from './routes/toolkit/bronnen'
import { Route as ToolkitIso2768RouteImport } from './routes/toolkit/iso-2768'
import { Route as ToolkitKantenRouteImport } from './routes/toolkit/kanten'
import { Route as ToolkitLagerpassingenRouteImport } from './routes/toolkit/lagerpassingen'
import { Route as ToolkitMotorspecificatieRouteImport } from './routes/toolkit/motorspecificatie'
import { Route as ToolkitORinggroefRouteImport } from './routes/toolkit/o-ringgroef'
import { Route as ToolkitPassingenRouteImport } from './routes/toolkit/passingen'
import { Route as ToolkitSeegerringGroefRouteImport } from './routes/toolkit/seegerring-groef'
import { Route as ToolkitSpiebaanTolerantiesRouteImport } from './routes/toolkit/spiebaan-toleranties'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const OverMijRoute = OverMijRouteImport.update({ id: '/over-mij', path: '/over-mij', getParentRoute: () => rootRouteImport } as any)
const ContactRoute = ContactRouteImport.update({ id: '/contact', path: '/contact', getParentRoute: () => rootRouteImport } as any)
const SpelRoute = SpelRouteImport.update({ id: '/spel', path: '/spel', getParentRoute: () => rootRouteImport } as any)
const BlogIndexRoute = BlogIndexRouteImport.update({ id: '/blog/', path: '/blog/', getParentRoute: () => rootRouteImport } as any)
const BlogUsbCLabtafelMhsRoute = BlogUsbCLabtafelMhsRouteImport.update({ id: '/blog/usb-c-labtafel-mhs', path: '/blog/usb-c-labtafel-mhs', getParentRoute: () => rootRouteImport } as any)
const MarathonRoute = MarathonRouteImport.update({ id: '/marathon', path: '/marathon', getParentRoute: () => rootRouteImport } as any)
const PodcastRoute = PodcastRouteImport.update({ id: '/podcast', path: '/podcast', getParentRoute: () => rootRouteImport } as any)
const ProjectRoute = ProjectRouteImport.update({ id: '/project', path: '/project', getParentRoute: () => rootRouteImport } as any)
const ProjectenRoute = ProjectenRouteImport.update({ id: '/projecten', path: '/projecten', getParentRoute: () => rootRouteImport } as any)
const ToolkitIndexRoute = ToolkitIndexRouteImport.update({ id: '/toolkit/', path: '/toolkit/', getParentRoute: () => rootRouteImport } as any)
const ToolkitEenhedenRoute = ToolkitEenhedenRouteImport.update({ id: '/toolkit/eenheden', path: '/toolkit/eenheden', getParentRoute: () => rootRouteImport } as any)
const ToolkitBevestigersRoute = ToolkitBevestigersRouteImport.update({ id: '/toolkit/bevestigers', path: '/toolkit/bevestigers', getParentRoute: () => rootRouteImport } as any)
const ToolkitCilinderRoute = ToolkitCilinderRouteImport.update({ id: '/toolkit/cilinder', path: '/toolkit/cilinder', getParentRoute: () => rootRouteImport } as any)
const ToolkitBronnenRoute = ToolkitBronnenRouteImport.update({ id: '/toolkit/bronnen', path: '/toolkit/bronnen', getParentRoute: () => rootRouteImport } as any)
const ToolkitIso2768Route = ToolkitIso2768RouteImport.update({ id: '/toolkit/iso-2768', path: '/toolkit/iso-2768', getParentRoute: () => rootRouteImport } as any)
const ToolkitKantenRoute = ToolkitKantenRouteImport.update({ id: '/toolkit/kanten', path: '/toolkit/kanten', getParentRoute: () => rootRouteImport } as any)
const ToolkitLagerpassingenRoute = ToolkitLagerpassingenRouteImport.update({ id: '/toolkit/lagerpassingen', path: '/toolkit/lagerpassingen', getParentRoute: () => rootRouteImport } as any)
const ToolkitMotorspecificatieRoute = ToolkitMotorspecificatieRouteImport.update({ id: '/toolkit/motorspecificatie', path: '/toolkit/motorspecificatie', getParentRoute: () => rootRouteImport } as any)
const ToolkitORinggroefRoute = ToolkitORinggroefRouteImport.update({ id: '/toolkit/o-ringgroef', path: '/toolkit/o-ringgroef', getParentRoute: () => rootRouteImport } as any)
const ToolkitPassingenRoute = ToolkitPassingenRouteImport.update({ id: '/toolkit/passingen', path: '/toolkit/passingen', getParentRoute: () => rootRouteImport } as any)
const ToolkitSeegerringGroefRoute = ToolkitSeegerringGroefRouteImport.update({ id: '/toolkit/seegerring-groef', path: '/toolkit/seegerring-groef', getParentRoute: () => rootRouteImport } as any)
const ToolkitSpiebaanTolerantiesRoute = ToolkitSpiebaanTolerantiesRouteImport.update({ id: '/toolkit/spiebaan-toleranties', path: '/toolkit/spiebaan-toleranties', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/over-mij': typeof OverMijRoute
  '/contact': typeof ContactRoute
  '/spel': typeof SpelRoute
  '/blog/': typeof BlogIndexRoute
  '/blog/usb-c-labtafel-mhs': typeof BlogUsbCLabtafelMhsRoute
  '/marathon': typeof MarathonRoute
  '/podcast': typeof PodcastRoute
  '/project': typeof ProjectRoute
  '/projecten': typeof ProjectenRoute
  '/toolkit/': typeof ToolkitIndexRoute
  '/toolkit/eenheden': typeof ToolkitEenhedenRoute
  '/toolkit/bevestigers': typeof ToolkitBevestigersRoute
  '/toolkit/cilinder': typeof ToolkitCilinderRoute
  '/toolkit/bronnen': typeof ToolkitBronnenRoute
  '/toolkit/iso-2768': typeof ToolkitIso2768Route
  '/toolkit/kanten': typeof ToolkitKantenRoute
  '/toolkit/lagerpassingen': typeof ToolkitLagerpassingenRoute
  '/toolkit/motorspecificatie': typeof ToolkitMotorspecificatieRoute
  '/toolkit/o-ringgroef': typeof ToolkitORinggroefRoute
  '/toolkit/passingen': typeof ToolkitPassingenRoute
  '/toolkit/seegerring-groef': typeof ToolkitSeegerringGroefRoute
  '/toolkit/spiebaan-toleranties': typeof ToolkitSpiebaanTolerantiesRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/over-mij': typeof OverMijRoute
  '/contact': typeof ContactRoute
  '/spel': typeof SpelRoute
  '/blog': typeof BlogIndexRoute
  '/blog/usb-c-labtafel-mhs': typeof BlogUsbCLabtafelMhsRoute
  '/marathon': typeof MarathonRoute
  '/podcast': typeof PodcastRoute
  '/project': typeof ProjectRoute
  '/projecten': typeof ProjectenRoute
  '/toolkit': typeof ToolkitIndexRoute
  '/toolkit/eenheden': typeof ToolkitEenhedenRoute
  '/toolkit/bevestigers': typeof ToolkitBevestigersRoute
  '/toolkit/cilinder': typeof ToolkitCilinderRoute
  '/toolkit/bronnen': typeof ToolkitBronnenRoute
  '/toolkit/iso-2768': typeof ToolkitIso2768Route
  '/toolkit/kanten': typeof ToolkitKantenRoute
  '/toolkit/lagerpassingen': typeof ToolkitLagerpassingenRoute
  '/toolkit/motorspecificatie': typeof ToolkitMotorspecificatieRoute
  '/toolkit/o-ringgroef': typeof ToolkitORinggroefRoute
  '/toolkit/passingen': typeof ToolkitPassingenRoute
  '/toolkit/seegerring-groef': typeof ToolkitSeegerringGroefRoute
  '/toolkit/spiebaan-toleranties': typeof ToolkitSpiebaanTolerantiesRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/over-mij': typeof OverMijRoute
  '/contact': typeof ContactRoute
  '/spel': typeof SpelRoute
  '/blog/': typeof BlogIndexRoute
  '/blog/usb-c-labtafel-mhs': typeof BlogUsbCLabtafelMhsRoute
  '/marathon': typeof MarathonRoute
  '/podcast': typeof PodcastRoute
  '/project': typeof ProjectRoute
  '/projecten': typeof ProjectenRoute
  '/toolkit/': typeof ToolkitIndexRoute
  '/toolkit/eenheden': typeof ToolkitEenhedenRoute
  '/toolkit/bevestigers': typeof ToolkitBevestigersRoute
  '/toolkit/cilinder': typeof ToolkitCilinderRoute
  '/toolkit/bronnen': typeof ToolkitBronnenRoute
  '/toolkit/iso-2768': typeof ToolkitIso2768Route
  '/toolkit/kanten': typeof ToolkitKantenRoute
  '/toolkit/lagerpassingen': typeof ToolkitLagerpassingenRoute
  '/toolkit/motorspecificatie': typeof ToolkitMotorspecificatieRoute
  '/toolkit/o-ringgroef': typeof ToolkitORinggroefRoute
  '/toolkit/passingen': typeof ToolkitPassingenRoute
  '/toolkit/seegerring-groef': typeof ToolkitSeegerringGroefRoute
  '/toolkit/spiebaan-toleranties': typeof ToolkitSpiebaanTolerantiesRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/over-mij' | '/contact' | '/spel' | '/blog/' | '/blog/usb-c-labtafel-mhs' | '/marathon' | '/podcast' | '/project' | '/projecten' | '/toolkit/' | '/toolkit/eenheden' | '/toolkit/bevestigers' | '/toolkit/cilinder' | '/toolkit/bronnen' | '/toolkit/iso-2768' | '/toolkit/kanten' | '/toolkit/lagerpassingen' | '/toolkit/motorspecificatie' | '/toolkit/o-ringgroef' | '/toolkit/passingen' | '/toolkit/seegerring-groef' | '/toolkit/spiebaan-toleranties'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/over-mij' | '/contact' | '/spel' | '/blog' | '/blog/usb-c-labtafel-mhs' | '/marathon' | '/podcast' | '/project' | '/projecten' | '/toolkit' | '/toolkit/eenheden' | '/toolkit/bevestigers' | '/toolkit/cilinder' | '/toolkit/bronnen' | '/toolkit/iso-2768' | '/toolkit/kanten' | '/toolkit/lagerpassingen' | '/toolkit/motorspecificatie' | '/toolkit/o-ringgroef' | '/toolkit/passingen' | '/toolkit/seegerring-groef' | '/toolkit/spiebaan-toleranties'
  id: '__root__' | '/' | '/over-mij' | '/contact' | '/spel' | '/blog/' | '/blog/usb-c-labtafel-mhs' | '/marathon' | '/podcast' | '/project' | '/projecten' | '/toolkit/' | '/toolkit/eenheden' | '/toolkit/bevestigers' | '/toolkit/cilinder' | '/toolkit/bronnen' | '/toolkit/iso-2768' | '/toolkit/kanten' | '/toolkit/lagerpassingen' | '/toolkit/motorspecificatie' | '/toolkit/o-ringgroef' | '/toolkit/passingen' | '/toolkit/seegerring-groef' | '/toolkit/spiebaan-toleranties'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  OverMijRoute: typeof OverMijRoute
  ContactRoute: typeof ContactRoute
  SpelRoute: typeof SpelRoute
  BlogIndexRoute: typeof BlogIndexRoute
  BlogUsbCLabtafelMhsRoute: typeof BlogUsbCLabtafelMhsRoute
  MarathonRoute: typeof MarathonRoute
  PodcastRoute: typeof PodcastRoute
  ProjectRoute: typeof ProjectRoute
  ProjectenRoute: typeof ProjectenRoute
  ToolkitIndexRoute: typeof ToolkitIndexRoute
  ToolkitEenhedenRoute: typeof ToolkitEenhedenRoute
  ToolkitBevestigersRoute: typeof ToolkitBevestigersRoute
  ToolkitCilinderRoute: typeof ToolkitCilinderRoute
  ToolkitBronnenRoute: typeof ToolkitBronnenRoute
  ToolkitIso2768Route: typeof ToolkitIso2768Route
  ToolkitKantenRoute: typeof ToolkitKantenRoute
  ToolkitLagerpassingenRoute: typeof ToolkitLagerpassingenRoute
  ToolkitMotorspecificatieRoute: typeof ToolkitMotorspecificatieRoute
  ToolkitORinggroefRoute: typeof ToolkitORinggroefRoute
  ToolkitPassingenRoute: typeof ToolkitPassingenRoute
  ToolkitSeegerringGroefRoute: typeof ToolkitSeegerringGroefRoute
  ToolkitSpiebaanTolerantiesRoute: typeof ToolkitSpiebaanTolerantiesRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/over-mij': { id: '/over-mij'; path: '/over-mij'; fullPath: '/over-mij'; preLoaderRoute: typeof OverMijRouteImport; parentRoute: typeof rootRouteImport }
    '/contact': { id: '/contact'; path: '/contact'; fullPath: '/contact'; preLoaderRoute: typeof ContactRouteImport; parentRoute: typeof rootRouteImport }
    '/spel': { id: '/spel'; path: '/spel'; fullPath: '/spel'; preLoaderRoute: typeof SpelRouteImport; parentRoute: typeof rootRouteImport }
    '/blog/': { id: '/blog/'; path: '/blog'; fullPath: '/blog/'; preLoaderRoute: typeof BlogIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/blog/usb-c-labtafel-mhs': { id: '/blog/usb-c-labtafel-mhs'; path: '/blog/usb-c-labtafel-mhs'; fullPath: '/blog/usb-c-labtafel-mhs'; preLoaderRoute: typeof BlogUsbCLabtafelMhsRouteImport; parentRoute: typeof rootRouteImport }
    '/marathon': { id: '/marathon'; path: '/marathon'; fullPath: '/marathon'; preLoaderRoute: typeof MarathonRouteImport; parentRoute: typeof rootRouteImport }
    '/podcast': { id: '/podcast'; path: '/podcast'; fullPath: '/podcast'; preLoaderRoute: typeof PodcastRouteImport; parentRoute: typeof rootRouteImport }
    '/project': { id: '/project'; path: '/project'; fullPath: '/project'; preLoaderRoute: typeof ProjectRouteImport; parentRoute: typeof rootRouteImport }
    '/projecten': { id: '/projecten'; path: '/projecten'; fullPath: '/projecten'; preLoaderRoute: typeof ProjectenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/': { id: '/toolkit/'; path: '/toolkit'; fullPath: '/toolkit/'; preLoaderRoute: typeof ToolkitIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/eenheden': { id: '/toolkit/eenheden'; path: '/toolkit/eenheden'; fullPath: '/toolkit/eenheden'; preLoaderRoute: typeof ToolkitEenhedenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/bevestigers': { id: '/toolkit/bevestigers'; path: '/toolkit/bevestigers'; fullPath: '/toolkit/bevestigers'; preLoaderRoute: typeof ToolkitBevestigersRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/cilinder': { id: '/toolkit/cilinder'; path: '/toolkit/cilinder'; fullPath: '/toolkit/cilinder'; preLoaderRoute: typeof ToolkitCilinderRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/bronnen': { id: '/toolkit/bronnen'; path: '/toolkit/bronnen'; fullPath: '/toolkit/bronnen'; preLoaderRoute: typeof ToolkitBronnenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/iso-2768': { id: '/toolkit/iso-2768'; path: '/toolkit/iso-2768'; fullPath: '/toolkit/iso-2768'; preLoaderRoute: typeof ToolkitIso2768RouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/kanten': { id: '/toolkit/kanten'; path: '/toolkit/kanten'; fullPath: '/toolkit/kanten'; preLoaderRoute: typeof ToolkitKantenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/lagerpassingen': { id: '/toolkit/lagerpassingen'; path: '/toolkit/lagerpassingen'; fullPath: '/toolkit/lagerpassingen'; preLoaderRoute: typeof ToolkitLagerpassingenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/motorspecificatie': { id: '/toolkit/motorspecificatie'; path: '/toolkit/motorspecificatie'; fullPath: '/toolkit/motorspecificatie'; preLoaderRoute: typeof ToolkitMotorspecificatieRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/o-ringgroef': { id: '/toolkit/o-ringgroef'; path: '/toolkit/o-ringgroef'; fullPath: '/toolkit/o-ringgroef'; preLoaderRoute: typeof ToolkitORinggroefRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/passingen': { id: '/toolkit/passingen'; path: '/toolkit/passingen'; fullPath: '/toolkit/passingen'; preLoaderRoute: typeof ToolkitPassingenRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/seegerring-groef': { id: '/toolkit/seegerring-groef'; path: '/toolkit/seegerring-groef'; fullPath: '/toolkit/seegerring-groef'; preLoaderRoute: typeof ToolkitSeegerringGroefRouteImport; parentRoute: typeof rootRouteImport }
    '/toolkit/spiebaan-toleranties': { id: '/toolkit/spiebaan-toleranties'; path: '/toolkit/spiebaan-toleranties'; fullPath: '/toolkit/spiebaan-toleranties'; preLoaderRoute: typeof ToolkitSpiebaanTolerantiesRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute, OverMijRoute, ContactRoute, SpelRoute, BlogIndexRoute, BlogUsbCLabtafelMhsRoute, MarathonRoute, PodcastRoute, ProjectRoute, ProjectenRoute, ToolkitIndexRoute, ToolkitEenhedenRoute, ToolkitBevestigersRoute, ToolkitCilinderRoute, ToolkitBronnenRoute, ToolkitIso2768Route, ToolkitKantenRoute, ToolkitLagerpassingenRoute, ToolkitMotorspecificatieRoute, ToolkitORinggroefRoute, ToolkitPassingenRoute, ToolkitSeegerringGroefRoute, ToolkitSpiebaanTolerantiesRoute,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
