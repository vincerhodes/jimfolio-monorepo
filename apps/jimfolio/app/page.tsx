import GarageCanvas from './components/GarageCanvas';
import { EXPERIMENT_STATIONS, GARAGE_STATIONS, SHIPPED_STATIONS } from './apps';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://jimsgarage.dev/#jimmy',
      name: 'Jimmy Rhodes',
      url: 'https://jimsgarage.dev',
      email: 'mailto:jim@jimsgarage.dev',
      sameAs: ['https://github.com/vincerhodes'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://jimsgarage.dev/#website',
      name: "Jim's Garage",
      url: 'https://jimsgarage.dev',
      author: { '@id': 'https://jimsgarage.dev/#jimmy' },
    },
    {
      '@type': 'ItemList',
      name: "Jim's Garage Projects",
      numberOfItems: GARAGE_STATIONS.length,
      itemListElement: GARAGE_STATIONS.map((station, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: station.name,
          url: station.url,
          description: station.description,
          applicationCategory:
            station.category === 'shipped' ? 'WebApplication' : 'DeveloperApplication',
          author: { '@id': 'https://jimsgarage.dev/#jimmy' },
        },
      })),
    },
  ],
};

function StationList({ stations }: { stations: typeof GARAGE_STATIONS }) {
  return (
    <ul>
      {stations.map((station) => (
        <li key={station.id}>
          <a href={station.url}>{station.name}</a> — {station.tagline}. {station.description}{' '}
          Built with {station.tech.join(', ')}.
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0b0d12]">
      <GarageCanvas />
      <section className="sr-only" aria-label="Jim's Garage project directory">
        <h1>Jim&apos;s Garage — Experiments, Tools &amp; Side Builds by Jimmy Rhodes</h1>
        <p>
          Jimmy Rhodes builds experiments, tools and side projects in an interactive 3D workshop.
          Get in touch at <a href="mailto:jim@jimsgarage.dev">jim@jimsgarage.dev</a> or on GitHub at{' '}
          <a href="https://github.com/vincerhodes">github.com/vincerhodes</a>.
        </p>
        <h2>Shipped Products</h2>
        <StationList stations={SHIPPED_STATIONS} />
        <h2>On the Bench — Garage Experiments</h2>
        <StationList stations={EXPERIMENT_STATIONS} />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  );
}
