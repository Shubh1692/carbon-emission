"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

/* -------------------------------- Types -------------------------------- */

type ProjectImage = { caption?: string; url: string };

type ProjectDoc = {
  url: string;
  filename?: string;
  category?: string;
  description?: string;
  size?: number;
  mimetype?: string;
};

type PortableBlock = {
  _type: "block";
  _key?: string;
  style?: "normal" | "h1" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  children: { _type: "span"; text: string; marks?: string[]; _key?: string }[];
  markDefs?: Array<{ _key: string; _type: string; href?: string; url?: string }>;
};

type ProjectToken = {
  id?: string;
  address?: string;
  decimals?: number;
  tokenStandard?: string;
  name?: string;
  isExAnte?: boolean;
  symbol?: string;
  tokenId?: number;
};

type ProjectListing = {
  id: string;
  creditId?: { vintage?: number; projectId?: string };
  token?: ProjectToken;
  sellerId?: string;
  expiresAfter?: number;
};

export type ProjectPrice = {
  sourceId: string;
  type: "listing" | string;
  purchasePrice: number;
  baseUnitPrice?: number;
  supply?: number;
  liquidSupply?: number;
  minFillAmount?: number;
  listing?: ProjectListing;
};

export type CarbonProjectDetail = {
  key: string;
  projectID?: string;
  name: string;
  methodologies?: { id: string; category?: string; name?: string; sector?: string | null }[];
  vintages?: string[];
  registry?: string;
  updatedAt?: number;
  country?: string;
  region?: string;
  price?: string | number;
  stats?: {
    totalBridged?: number;
    totalRetired?: number;
    totalSupply?: number;
    totalListingsSupply?: number;
    totalPoolsSupply?: number;
  };
  hasSupply?: boolean;
  sustainableDevelopmentGoals?: string[];
  status?: string;
  type?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  block_long_description?: PortableBlock[];
  url?: string | null;

  images?: ProjectImage[];
  coverImage?: ProjectImage;
  satelliteImage?: ProjectImage;

  documents?: ProjectDoc[];
  standards?: { name: string; link?: string }[];

  estAnnualMitigations?: number;
  location?: { geometry?: { coordinates?: [number, number] } };

  prices?: ProjectPrice[];

  registryLogoUrl?: string | null;
};

type Props = {
  project: CarbonProjectDetail;
};

/* ------------------------------- Helpers -------------------------------- */

const pill = (base: string) =>
  `inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${base}`;

function n2(v?: number | string) {
  if (v === null || v === undefined) return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

function formatNum(v?: number | string, digits = 3) {
  const n = n2(v);
  if (n === null) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function formatPrice(v?: number | string) {
  const n = n2(v);
  if (n === null) return "0.00";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getPrimaryImage(p: CarbonProjectDetail) {
  return p.coverImage?.url || p.images?.[0]?.url || p.satelliteImage?.url || "";
}

function flattenText(blocks?: PortableBlock[]) {
  if (!blocks?.length) return "";
  return blocks.map((b) => b.children?.map((c) => c.text).join("") ?? "").join("\n\n");
}

function renderPortableBlocks(blocks?: PortableBlock[]) {
  if (!blocks?.length) return null;

  return (
    <div className="prose prose-sm max-w-none prose-headings:scroll-mt-24 dark:prose-invert">
      {blocks.map((b, idx) => {
        const text = b.children?.map((c) => c.text).join("") ?? "";
        const Tag =
          b.style === "h1"
            ? "h1"
            : b.style === "h2"
            ? "h2"
            : b.style === "h3"
            ? "h3"
            : b.style === "blockquote"
            ? "blockquote"
            : "p";

        if (b.listItem === "bullet") {
          return (
            <ul key={b._key ?? idx} className="my-2 list-disc pl-5">
              <li>{text}</li>
            </ul>
          );
        }

        return <Tag key={b._key ?? idx}>{text}</Tag>;
      })}
    </div>
  );
}

/* -------------------------- UI tiny components -------------------------- */

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left
                   hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                   dark:hover:bg-white/10 dark:focus:ring-white/10"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">Learn what happens next</p>
        </div>
        <span className="text-gray-500 dark:text-slate-300">
          <IconChevron open={open} />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

const SDG_TEXT: Record<string, string> = {
  "1": "End poverty in all its forms everywhere.",
  "8": "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
  "13": "Take urgent action to combat climate change and its impacts.",
  "15": "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation, and halt biodiversity loss.",
};

/* ------------------------------ Component ------------------------------- */

export default function CarbonProjectDetails({ project }: Props) {
  const router = useRouter();

  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeSlide, setActiveSlide] = useState(1);
  const [retireOpen, setRetireOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<ProjectPrice | null>(null);

  const [retireTonnes, setRetireTonnes] = useState<number>(0);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [publicMessage, setPublicMessage] = useState("");

  const [retireError, setRetireError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!retireOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRetireModal();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [retireOpen]);

  const heroImg = getPrimaryImage(project);

  const allImages = useMemo(() => {
    const arr: ProjectImage[] = [];
    if (project.coverImage?.url) arr.push(project.coverImage);
    if (project.images?.length) arr.push(...project.images);
    if (project.satelliteImage?.url) arr.push(project.satelliteImage);
    const seen = new Set<string>();
    return arr.filter((im) => {
      if (!im?.url) return false;
      if (seen.has(im.url)) return false;
      seen.add(im.url);
      return true;
    });
  }, [project]);

  const prices = useMemo(() => {
    const arr = project.prices ?? [];
    return [...arr].sort((a, b) => (a.purchasePrice ?? 0) - (b.purchasePrice ?? 0));
  }, [project.prices]);

  const longTextFallback = project.long_description || project.description || project.short_description || "";
  const longFromBlocks = flattenText(project.block_long_description);
  const overviewText = longFromBlocks || longTextFallback;

  const totalRetired = n2(project.stats?.totalRetired) ?? 0;
  const totalSupply = n2(project.stats?.totalSupply) ?? 0;
  const remainingSupply = Math.max(0, totalSupply - totalRetired);
  const selectedUnitPrice = selectedPrice?.purchasePrice ?? 0;
  const selectedAvailable = selectedPrice?.liquidSupply ?? selectedPrice?.supply ?? 0;
  const selectedMinFill = selectedPrice?.minFillAmount ?? 0.001;
  const retireTotalCost = Math.max(0, retireTonnes) * selectedUnitPrice;

  const clampTonnes = (v: number) => {
    const next = Number.isFinite(v) ? v : 0;
    if (selectedAvailable > 0) return Math.min(selectedAvailable, Math.max(0, next));
    return Math.max(0, next);
  };

  const openRetireModal = (p: ProjectPrice) => {
    setSelectedPrice(p);
    setRetireTonnes(0);
    setBeneficiaryName("");
    setPublicMessage("");
    setRetireError(null);
    setSavingOrder(false);
    setRetireOpen(true);
  };

  const closeRetireModal = () => {
    if (savingOrder) return;
    setRetireOpen(false);
    setSelectedPrice(null);
    setRetireError(null);
  };

  const submitRetire = async () => {
    if (!selectedPrice) return;

    setRetireError(null);
    const t = Number(retireTonnes || 0);

    if (!Number.isFinite(t) || t <= 0) return setRetireError("Please enter a valid tonnes amount (> 0).");
    if (t < selectedMinFill) return setRetireError(`Minimum fill amount is ${selectedMinFill}.`);
    if (selectedAvailable > 0 && t > selectedAvailable)
      return setRetireError(`Tonnes cannot exceed max available (${selectedAvailable}).`);
    if (!beneficiaryName.trim()) return setRetireError("Beneficiary name is required.");
    if (!publicMessage.trim()) return setRetireError("Public message is required.");

    try {
      setSavingOrder(true);

      const res = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectKey: project.key,
          sourceId: selectedPrice.sourceId,
          listingId: selectedPrice.listing?.id ?? null,
          priceType: selectedPrice.type,
          unitPrice: selectedUnitPrice,
          tonnes: t,
          totalCost: t * selectedUnitPrice,
          beneficiaryName: beneficiaryName.trim(),
          publicMessage: publicMessage.trim(),
          token: selectedPrice.listing?.token ?? null,
          creditId: selectedPrice.listing?.creditId ?? null,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create order. Please try again.";
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {}
        setRetireError(msg);
        return;
      }

      closeRetireModal();
      router.push("/orders");
    } catch (e: any) {
      setRetireError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSavingOrder(false);
    }
  };

  const registryName = project.registry || "Registry";
  const registryLabel = registryName === "ICR" ? "International Carbon Registry" : registryName;

  const registryLogoFallback = useMemo(() => {
    const parts = registryLabel.split(" ").filter(Boolean);
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
    return initials || "R";
  }, [registryLabel]);

  const galleryNavKey = useMemo(() => `gallery-${project.key}`.replace(/[^a-zA-Z0-9_-]/g, ""), [project.key]);

  const inputCls =
    "w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700 " +
    "dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-400 " +
    "dark:focus:ring-white/10 dark:focus:border-teal-500";

  const textareaCls =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700 " +
    "dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-400 " +
    "dark:focus:ring-white/10 dark:focus:border-teal-500";

  const softCard = "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-white/5";
  const softHeader = "px-5 py-4 border-b bg-gray-50 dark:bg-white/5 dark:border-white/10";
  const hTitle = "text-sm font-semibold text-gray-900 dark:text-white";
  const hSub = "text-xs text-gray-500 dark:text-slate-300";

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push(`/credits`)}
          className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                     hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                     dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
        >
          ← Back to marketplace
        </button>

        <div className="flex items-center gap-2">
          {project.status ? (
            <span className={pill("bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200")}>
              {project.status}
            </span>
          ) : null}
          {project.type ? (
            <span className={pill("bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200")}>
              {project.type}
            </span>
          ) : null}
          {project.registry ? (
            <span className={pill("bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-slate-200")}>
              {project.registry}
            </span>
          ) : null}
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="relative aspect-[21/9] bg-gray-100 dark:bg-white/10">
          {heroImg ? (
            <Image
              src={heroImg}
              alt={project.name}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-gray-100 dark:from-teal-500/10 dark:to-white/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-white/80 text-xs font-semibold">
              {project.key}
              {project.country ? ` · ${project.country}` : ""}
              {project.region ? ` · ${project.region}` : ""}
            </p>
            <h1 className="mt-1 text-white text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.short_description ? (
              <p className="mt-2 text-white/85 text-sm line-clamp-2 max-w-3xl">{project.short_description}</p>
            ) : null}
          </div>
        </div>

        {/* Top stats strip */}
        <div className="p-5 sm:p-7 border-t border-gray-200 dark:border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total supply", value: formatNum(project.stats?.totalSupply, 3), sub: "tCO2e" },
              { label: "Total retired", value: formatNum(project.stats?.totalRetired, 3), sub: "tCO2e" },
              { label: "Remaining supply", value: formatNum(remainingSupply, 3), sub: "tCO2e" },
              { label: "Listings", value: String(prices.length), sub: "prices" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs text-gray-500 dark:text-slate-300">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.methodologies?.slice(0, 3)?.map((m) => (
              <span
                key={m.id}
                className={pill("bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200 dark:border dark:border-teal-500/20")}
              >
                {m.category ?? "Methodology"} · {m.id}
              </span>
            ))}
            {project.vintages?.slice(0, 6)?.map((v) => (
              <span key={v} className={pill("bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-slate-200")}>
                Vintage {v}
              </span>
            ))}
            {project.sustainableDevelopmentGoals?.slice(0, 10)?.map((s) => (
              <span
                key={s}
                className={pill("bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 dark:border dark:border-amber-500/20")}
              >
                SDG {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overview */}
          <section className={softCard}>
            <div className={softHeader}>
              <p className={hTitle}>Overview</p>
              <p className={hSub}>Project description & details</p>
            </div>
            <div className="p-5">
              {project.block_long_description?.length ? (
                renderPortableBlocks(project.block_long_description)
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {overviewText
                    .split("\n\n")
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              )}
            </div>
          </section>

          {/* Gallery */}
          {allImages.length ? (
            <section className={`${softCard} project-gallery`}>
              <div className={softHeader}>
                <p className={hTitle}>Gallery</p>
                <p className={hSub}>{allImages.length} images</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/10">
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/35 to-transparent" />

                  <div className="absolute right-3 top-3 z-20">
                    <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      {activeSlide}/{allImages.length}
                    </span>
                  </div>

                  {allImages.length > 1 ? (
                    <>
                      <button
                        id={`${galleryNavKey}-prev`}
                        type="button"
                        aria-label="Previous image"
                        className="gallery-nav-btn left-3"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <button
                        id={`${galleryNavKey}-next`}
                        type="button"
                        aria-label="Next image"
                        className="gallery-nav-btn right-3"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  ) : null}

                  <Swiper
                    modules={[Navigation, Pagination, Thumbs, Keyboard, A11y]}
                    keyboard={{ enabled: true }}
                    pagination={{ clickable: true }}
                    grabCursor
                    speed={450}
                    onSlideChange={(s) => setActiveSlide((s.realIndex ?? s.activeIndex) + 1)}
                    navigation={
                      allImages.length > 1
                        ? {
                            prevEl: `#${galleryNavKey}-prev`,
                            nextEl: `#${galleryNavKey}-next`,
                            disabledClass: "swiper-button-disabled",
                          }
                        : false
                    }
                    onBeforeInit={(swiper) => {
                      if (allImages.length <= 1) return;
                      swiper.params.navigation = {
                        prevEl: `#${galleryNavKey}-prev`,
                        nextEl: `#${galleryNavKey}-next`,
                        disabledClass: "swiper-button-disabled",
                      };
                    }}
                    thumbs={{
                      swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                    }}
                    className="w-full"
                  >
                    {allImages.map((im, idx) => (
                      <SwiperSlide key={`${im.url}-main-${idx}`}>
                        <div className="relative aspect-[16/9] bg-gray-100 dark:bg-white/10">
                          <Image
                            src={im.url}
                            alt={im.caption || `Image ${idx + 1}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 900px"
                            className="object-cover"
                            priority={idx === 0}
                          />
                        </div>

                        {im.caption ? (
                          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-3">
                            <p className="text-xs text-white/90 line-clamp-2">{im.caption}</p>
                          </div>
                        ) : null}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Thumbs (optional - keep your old thumbs code if you already have it) */}
                {allImages.length > 1 ? (
                  <Swiper
                    modules={[Thumbs]}
                    onSwiper={setThumbsSwiper}
                    watchSlidesProgress
                    spaceBetween={10}
                    slidesPerView={Math.min(6, allImages.length)}
                    className="w-full"
                  >
                    {allImages.map((im, idx) => (
                      <SwiperSlide key={`${im.url}-thumb-${idx}`}>
                        <button
                          type="button"
                          className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100
                                     hover:opacity-95 dark:border-white/10 dark:bg-white/10"
                        >
                          <Image src={im.url} alt={im.caption || `Thumb ${idx + 1}`} fill className="object-cover" />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Registry */}
          <section className={softCard}>
            <div className={softHeader}>
              <p className={hTitle}>Registry</p>
              <p className={hSub}>Verification & certification source</p>
            </div>

            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center dark:border-white/10 dark:bg-white/5">
                    {project.registryLogoUrl ? (
                      <img src={project.registryLogoUrl} alt={`${registryLabel} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-gray-700 dark:text-slate-200">{registryLogoFallback}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{registryLabel}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={pill("bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-slate-200")}>
                        {project.registry ?? "Registry"}
                      </span>
                      <span className={pill("bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200")}>
                        {project.status ? project.status : "Verified & Certified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={project.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center justify-center h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                               hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                               dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10
                               ${project.url ? "" : "pointer-events-none opacity-50"}`}
                  >
                    View detailed project verification
                  </a>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Verified & Certified</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  Each credit represents one tonne of CO2 emissions reduced, removed, or avoided, as verified by registry-approved third-party auditors.
                </p>
              </div>
            </div>
          </section>

          {/* SDGs */}
          {project.sustainableDevelopmentGoals?.length ? (
            <section className={softCard}>
              <div className={`${softHeader} flex items-start justify-between gap-3`}>
                <div>
                  <p className={hTitle}>Sustainable Development Goals</p>
                  <p className={hSub}>UN SDGs supported by this project</p>
                </div>
                <a
                  href="https://sdgs.un.org/goals"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  Learn more about the UN&apos;s SDGs →
                </a>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.sustainableDevelopmentGoals.map((id) => (
                  <div key={id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">SDG {id}</p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                          {SDG_TEXT[id] || "Supports a United Nations Sustainable Development Goal."}
                        </p>
                      </div>
                      <span className={pill("bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 dark:border dark:border-amber-500/20")}>
                        Goal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Stats */}
          <section className={softCard}>
            <div className={softHeader}>
              <p className={hTitle}>Stats</p>
              <p className={hSub}>Data for this project</p>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-slate-300">Total Retirements</p>
                <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                  {formatNum(project.stats?.totalRetired, 2)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-slate-300">Total Remaining Supply</p>
                <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                  {formatNum(remainingSupply, 2)}
                </p>
              </div>
            </div>
          </section>

          {/* Documents */}
          {project.documents?.length ? (
            <section className={softCard}>
              <div className={softHeader}>
                <p className={hTitle}>Documents</p>
                <p className={hSub}>Reports, verification and supporting files</p>
              </div>

              <div className="p-2">
                {project.documents.map((d, idx) => (
                  <div
                    key={`${d.url}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl
                               hover:bg-gray-50 dark:hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {d.filename ?? `Document ${idx + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">
                        {d.category ? `${d.category}` : "Document"}
                        {d.mimetype ? ` · ${d.mimetype}` : ""}
                        {d.size ? ` · ${formatBytes(d.size)}` : ""}
                      </p>
                      {d.description ? (
                        <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 line-clamp-2">{d.description}</p>
                      ) : null}
                    </div>

                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl
                                 border border-gray-200 bg-white text-gray-800 font-semibold
                                 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                                 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Prices */}
            {prices.length ? (
              <div className={softCard}>
                <div className={softHeader}>
                  <p className={hTitle}>Prices</p>
                  <p className={hSub}>Choose a listing to retire</p>
                </div>

                <div className="p-3 space-y-3">
                  {prices.map((p) => {
                    const available = p.liquidSupply ?? p.supply ?? 0;
                    const tokenSymbol = p.listing?.token?.symbol ?? "-";
                    const vintage = p.listing?.creditId?.vintage;
                    const pid = p.listing?.creditId?.projectId;

                    return (
                      <div
                        key={p.sourceId}
                        className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition
                                   dark:border-white/10 dark:hover:bg-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tokenSymbol}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-300 mt-1 truncate">
                              {pid ? pid : "Project"}
                              {vintage ? ` · Vintage ${vintage}` : ""}
                            </p>
                          </div>
                          <span className={pill("bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200 dark:border dark:border-teal-500/20")}>
                            {p.type}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 dark:bg-white/5 dark:border-white/10">
                            <p className="text-[11px] text-gray-500 dark:text-slate-300">Price / tonne</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">${formatPrice(p.purchasePrice)}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 dark:bg-white/5 dark:border-white/10">
                            <p className="text-[11px] text-gray-500 dark:text-slate-300">Available</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {available ? formatNum(available, 3) : "-"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openRetireModal(p)}
                          className="mt-4 w-full inline-flex items-center justify-center h-11 px-4 rounded-xl
                                     bg-teal-700 text-white font-semibold shadow-sm
                                     hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200
                                     dark:focus:ring-teal-900/30"
                        >
                          Retire carbon
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={softCard}>
                <div className={softHeader}>
                  <p className={hTitle}>Prices</p>
                  <p className={hSub}>No listings available</p>
                </div>
                <div className="p-5 text-sm text-gray-600 dark:text-slate-300">
                  This project currently has no retire listings.
                </div>
              </div>
            )}

            <Accordion defaultOpen={false} title="What happens after I click Retire Carbon?">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300 pt-3">
                {[
                  "Enter your payment information, complete the secure payment transaction, and your retirement will be recorded on-chain.",
                  "You'll get a digital certificate and a downloadable certificate (PDF).",
                  "The credits are permanently removed from circulation.",
                  "Your impact will be visible, traceable and auditable by third parties via our tooling.",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-500 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Responsive Modal */}
      {retireOpen ? (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeRetireModal}
          />

          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div
              className="w-full sm:max-w-2xl bg-white shadow-2xl border border-gray-200 rounded-t-3xl sm:rounded-3xl overflow-hidden
                         dark:bg-slate-950 dark:border-white/10"
              role="dialog"
              aria-modal="true"
            >
              {/* header */}
              <div className="px-4 sm:px-6 py-4 border-b bg-gray-50 flex items-start justify-between gap-3 dark:bg-white/5 dark:border-white/10">
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Confirm retirement</p>
                  <p className="text-xs text-gray-500 dark:text-slate-300 truncate">
                    {selectedPrice?.listing?.token?.symbol ?? "Selected listing"}
                    {selectedPrice?.listing?.creditId?.vintage
                      ? ` · Vintage ${selectedPrice.listing.creditId.vintage}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRetireModal}
                  disabled={savingOrder}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white
                             hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50
                             dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* body scroll */}
              <div className="max-h-[75vh] sm:max-h-[80vh] overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-4">
                  {/* summary */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Amount to retire", value: `${retireTonnes || 0} tonnes` },
                        { label: "Price per tonne", value: `$${formatPrice(selectedUnitPrice)}` },
                        { label: "Total cost", value: `$${formatPrice(retireTotalCost)}` },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-200 p-3 dark:bg-white/5 dark:border-white/10">
                          <p className="text-[11px] text-gray-500 dark:text-slate-300">{s.label}</p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* form */}
                  <div className="rounded-3xl border border-gray-200 overflow-hidden dark:border-white/10">
                    <div className="px-4 sm:px-6 py-4 border-b bg-gray-50 dark:bg-white/5 dark:border-white/10">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Retirement details</p>
                      <p className="text-xs text-gray-500 dark:text-slate-300">
                        <span className="text-red-600">*</span> Required fields
                      </p>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                          How many tonnes would you like to retire? <span className="text-red-600">*</span>
                        </label>

                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] text-gray-500 dark:text-slate-300">
                            Available: {selectedAvailable ? formatNum(selectedAvailable, 3) : "-"}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-300">Min: {selectedMinFill}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="number"
                            min={selectedMinFill}
                            max={selectedAvailable > 0 ? selectedAvailable : undefined}
                            step={selectedMinFill}
                            value={retireTonnes}
                            onChange={(e) => setRetireTonnes(clampTonnes(Number(e.target.value || 0)))}
                            className={inputCls}
                            placeholder="Tonnes"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedAvailable > 0) setRetireTonnes(selectedAvailable);
                            }}
                            className="w-30 h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                                       hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50
                                       dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                            disabled={selectedAvailable <= 0}
                          >
                            Use max
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                          Beneficiary name <span className="text-red-600">*</span>
                        </label>
                        <input
                          value={beneficiaryName}
                          onChange={(e) => setBeneficiaryName(e.target.value)}
                          className={inputCls}
                          placeholder="Beneficiary name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                          Public message <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={publicMessage}
                          onChange={(e) => setPublicMessage(e.target.value)}
                          rows={3}
                          className={textareaCls}
                          placeholder="Public message"
                        />
                      </div>

                      {retireError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
                                        dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                          {retireError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="px-4 sm:px-6 py-4 border-t bg-white dark:bg-slate-950 dark:border-white/10">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={closeRetireModal}
                    disabled={savingOrder}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold
                               hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50
                               dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitRetire}
                    disabled={savingOrder || !selectedPrice}
                    className="w-full h-11 px-4 rounded-xl bg-teal-700 text-white font-semibold shadow-sm
                               hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:opacity-50
                               dark:focus:ring-teal-900/30"
                  >
                    {savingOrder ? "Saving..." : "Confirm retirement"}
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-gray-500 dark:text-slate-300">
                  Confirm retirement will create an order via <span className="font-semibold">/api/orders</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
