"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { SlotButton, useHydrated, useRiptide } from "@riptide/core";
import { Icon, Poster, Rail, Stars, TitleCard, useOtt, useToast } from "@/components/ui";
import { genreName, runtime, titleById, titlesByGenre } from "@/lib/catalogue";

export default function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = titleById(id);
  if (!t) notFound();
  const { base } = useRiptide();
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const [season, setSeason] = useState(1);
  const [toast, show] = useToast();
  const saved = hydrated && s.myList.includes(t.id);
  const eps = t.seasons.find((x) => x.n === season)?.episodes ?? [];
  const more = titlesByGenre(t.genre).filter((x) => x.id !== t.id);

  return (
    <main data-riptide-step="title">
      <section className="rb-detail">
        <Poster t={t} wide className="rb-detail__backdrop" />
        <div className="rb-wrap rb-detail__inner">
          <nav aria-label="Breadcrumb" className="rb-crumbs">
            <Link href={`${base}/browse`}>Browse</Link><span aria-hidden>/</span>
            <Link href={`${base}/search?genre=${t.genre}`}>{genreName(t.genre)}</Link><span aria-hidden>/</span>
            <span aria-current="page">{t.title}</span>
          </nav>
          <div className="rb-detail__grid">
            <Poster t={t} className="rb-detail__poster" />
            <div className="rb-stack">
              <p className="rb-eyebrow">{t.kind === "series" ? "Series" : "Film"} · {genreName(t.genre)}</p>
              <h1 className="rb-display">{t.title}</h1>
              <p className="rb-feature-hero__meta">
                <Stars value={t.rating} count={t.ratingCount} /><span>{t.year}</span><span className="rb-chip">{t.maturity}</span>
                <span>{runtime(t)}</span><span className="rb-chip">{t.quality}</span><span>{t.language}</span>
              </p>
              <p className="rb-lede">{t.synopsis}</p>
              <div className="rb-actions">
                <SlotButton id="title.cta.play" variant="primary" onClick={() => show("Playback isn't available in this sandbox.")}>
                  <Icon name="play" fill /> {t.kind === "series" ? "Play S1 E1" : "Play"}
                </SlotButton>
                <SlotButton id="title.cta.mylist" variant="secondary" aria-pressed={saved}
                  onClick={() => { set((st) => ({ myList: saved ? st.myList.filter((x) => x !== t.id) : [...st.myList, t.id] })); show(saved ? "Removed from My List" : "Added to My List"); }}>
                  <Icon name={saved ? "check" : "plus"} /> {saved ? "In My List" : "My List"}
                </SlotButton>
              </div>
              <dl className="rb-credits">
                <div><dt>Starring</dt><dd>{t.cast.join(", ")}</dd></div>
                <div><dt>{t.kind === "series" ? "Created by" : "Directed by"}</dt><dd>{t.creator}</dd></div>
                <div><dt>Audio</dt><dd>{t.language}, with English subtitles</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="rb-wrap rb-stack">
        {t.kind === "series" && (
          <section aria-labelledby="eps-h" className="rb-episodes">
            <div className="rb-episodes__head">
              <h2 id="eps-h" className="rb-h2">Episodes</h2>
              <div className="rb-filters" role="group" aria-label="Season">
                {t.seasons.map((x) => (
                  <button key={x.n} type="button" className="rb-chipbtn" aria-pressed={season === x.n} onClick={() => setSeason(x.n)}>
                    Season {x.n} <span className="rb-muted">({x.year})</span>
                  </button>
                ))}
              </div>
            </div>
            <ol className="rb-eplist">
              {eps.map((e) => (
                <li key={e.n} className="rb-ep">
                  <span className="rb-ep__n">{e.n}</span>
                  <div><h3 className="rb-ep__title">{e.title}</h3><p className="rb-muted">{e.synopsis}</p></div>
                  <span className="rb-muted">{e.minutes} min</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        <Rail title={`More ${genreName(t.genre).toLowerCase()}`}>{more.map((x) => <TitleCard key={x.id} t={x} />)}</Rail>
      </div>
      {toast}
    </main>
  );
}
