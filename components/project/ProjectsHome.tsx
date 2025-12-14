"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types/project";
import Swal from "sweetalert2";
import { useTheme } from "next-themes";

type FormState = {
  name: string;
  description: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function ProjectsHome() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [active, setActive] = useState<Project | null>(null);

  const [form, setForm] = useState<FormState>({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const openCreate = () => {
    setMode("create");
    setActive(null);
    setForm({ name: "", description: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setMode("edit");
    setActive(p);
    setForm({ name: p.name, description: p.description ?? "" });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = (await res.json()) as { projects: Project[] };
      setProjects(data.projects ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async () => {
    setError(null);

    const name = form.name.trim();
    if (name.length < 2) {
      setError("Project name must be at least 2 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description: form.description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create project");

        setProjects((prev) => [data.project as Project, ...prev]);
      } else {
        if (!active) return;

        const res = await fetch(`/api/projects/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description: form.description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update project");

        setProjects((prev) =>
          prev.map((p) => (p.id === active.id ? (data.project as Project) : p))
        );
      }

      setModalOpen(false);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (p: Project) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      background: isDark ? "#0b1220" : "#ffffff",
      color: isDark ? "#e5e7eb" : "#111827",
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete project");

      setProjects((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: any) {
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: e?.message ?? "Delete Failed. Something went wrong.",
        background: isDark ? "#0b1220" : "#ffffff",
        color: isDark ? "#e5e7eb" : "#111827",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">
              Create a project and open its Carbon Calculator by Project ID.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/credits"
              className="h-11 px-5 rounded-xl border border-black/10 bg-white text-gray-900 font-semibold shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-teal-100
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10 flex items-center justify-center"
            >
              Buy Credits
            </Link>

            <Link
              href="/orders"
              className="h-11 px-5 rounded-xl border border-black/10 bg-white text-gray-900 font-semibold shadow-sm
                         hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-teal-100
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10 flex items-center justify-center"
            >
              Orders
            </Link>

            <button
              onClick={openCreate}
              className="h-11 px-5 rounded-xl bg-teal-700 text-white font-semibold shadow-sm
                         hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200
                         dark:focus:ring-teal-900/40"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Search + stats */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, description, or ID..."
              className="w-full h-11 pl-4 pr-4 rounded-xl border border-gray-200 bg-white
                         text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400
                         dark:focus:ring-white/10 dark:focus:border-teal-500"
            />
          </div>

          <div className="flex gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5">
              <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span> total
            </div>
            <button
              onClick={() => void load()}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-900 hover:bg-gray-50
                         dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              Loading projects…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">No projects found</div>
              <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">
                Create your first project to start calculating carbon.
              </p>
              <button
                onClick={openCreate}
                className="mt-5 h-11 px-5 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800"
              >
                + New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden
                             dark:border-white/10 dark:bg-white/5"
                >
                  <Link
                    href={`/projects/${p.id}`}
                    className="block p-5 hover:bg-gray-50 transition dark:hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-300 mt-1">
                          Updated: {formatDate(p.updatedAt)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100
                                       dark:bg-teal-500/15 dark:text-teal-200 dark:border-teal-400/20">
                        Open
                      </span>
                    </div>

                    {p.description ? (
                      <p className="text-sm text-gray-600 dark:text-slate-200 mt-3 line-clamp-2">
                        {p.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-slate-400 mt-3 italic">
                        No description
                      </p>
                    )}

                    <div className="mt-4 text-[11px] text-gray-400 break-all">
                      ID: <span className="text-gray-500 dark:text-slate-300">{p.id}</span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200 bg-white
                                  dark:border-white/10 dark:bg-transparent">
                    <button
                      onClick={() => openEdit(p)}
                      className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold
                                 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100
                                 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void onDelete(p)}
                      className="h-9 px-3 rounded-xl border border-red-200 bg-white text-red-700 font-semibold
                                 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100
                                 dark:border-red-500/30 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-500/10"
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden
                          dark:bg-slate-900 dark:border-white/10">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between
                            dark:border-white/10 dark:bg-white/5">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === "create" ? "Create Project" : "Edit Project"}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-300">
                  {mode === "create" ? "Create a new project for carbon calculation." : `Project ID: ${active?.id}`}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white font-semibold hover:bg-gray-50
                           dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                disabled={busy}
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Project Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900
                             focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700
                             dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-white/10 dark:focus:border-teal-500"
                  placeholder="e.g. Dubai Trip"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  className="w-full min-h-[96px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
                             focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-700
                             dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-white/10 dark:focus:border-teal-500"
                  placeholder="Optional: goals, travel plan, notes…"
                  disabled={busy}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
                                dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-2
                            dark:border-white/10 dark:bg-transparent">
              <button
                onClick={closeModal}
                className="h-11 px-5 rounded-xl border border-gray-200 bg-white font-semibold hover:bg-gray-50
                           dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="h-11 px-5 rounded-xl bg-teal-700 text-white font-semibold shadow-sm
                           hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? "Saving..." : mode === "create" ? "Create Project" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
