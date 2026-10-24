"use client";
import Link from "next/link";
import { Slot, SlotButton, useHydrated, useRiptide } from "@riptide/core";
import { Icon, Poster, Rail, Stars, TitleCard, useOtt, useToast } from "@/components/ui";
import { CONTINUE_WATCHING, FEATURED_ID, GENRES, TITLES, genreName, runtime, titleById, titlesByGenre } from "@/lib/catalogue";

export default function Browse() {
  const { base } = useRiptide();
  const [s] = useOtt();
  const hydrated = useHydrated();
  const [toast, show] = useToast();
  const f = titleById(FEATURED_ID)!;
  const myList = hydrated ? s.myList.map(titleById).filter((t) => !!t) : [];
  const top = [...TITLES].sort((a, b) => b.rating - a.rating).slice(0, 10);

  return (
    <main data-riptide-step="browse">
      <section className="rb-feature-hero" aria-label="Featured title">
        <Poster t={f} wide className="rb-feature-hero__art" />
        <div className="rb-wrap rb-feature-hero__inner">
          <p className="rb-eyebrow">Featured series · {genreName(f.genre)}</p>
          <Slot id="browse.hero.title" as="h1" className="rb-display">{f.title}</Slot>
          <p className="rb-feature-hero__meta"><Stars value={f.rating} /> <span>{f.year}</span><span className="rb-chip">{f.maturity}</span><span>{runtime(f)}</span><span className="rb-chip">{f.quality}</span></p>
          <p className="rb-lede">{f.logline}</p>
          <div className="rb-actions">
            <SlotButton id="browse.hero.play" variant="primary" onClick={() => show("Playback isn't available in this sandbox.")}><Icon name="play" fill /> Play</SlotButton>
            <Slot id="browse.hero.info" as={Link} href={`${base}/title/${f.id}`} className="rt-btn" variant="secondary"><Icon name="info" /> More info</Slot>
          </div>
        </div>
      </section>

      <div className="rb-wrap rb-stack">
        <Slot id="browse.promo.banner" className="rb-promo-slot" />

        <Slot id="browse.rail.continue">
          <Rail title="Continue watching for Demo Viewer">
            {CONTINUE_WATCHING.map(({ id, progress, label }) => {
              const t = titleById(id)!;
              return (
                <TitleCard key={id} t={t}>
                  <span className="rb-progressbar" aria-label={`${Math.round(progress * 100)}% watched`}><span style={{ width: `${progress * 100}%` }} /></span>
                  <span className="rb-tile__resume">{label}</span>
                </TitleCard>
              );
            })}
          </Rail>
        </Slot>

        {myList.length > 0 && (
          <Rail title="My List">{myList.map((t) => <TitleCard key={t.id} t={t} />)}</Rail>
        )}

        <Rail title="Top rated on Reelbox">
          {top.map((t, i) => <TitleCard key={t.id} t={t}><span className="rb-rank">#{i + 1}</span></TitleCard>)}
        </Rail>

        {GENRES.map((g) => (
          <Rail key={g.id} title={g.name} href={`${base}/search?genre=${g.id}`}>
            {titlesByGenre(g.id).map((t) => <TitleCard key={t.id} t={t} />)}
          </Rail>
        ))}
      </div>
      {toast}
    </main>
  );
}
