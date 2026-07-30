"use client";

// Port of app/(tabs)/search.tsx: built-in HIGH_FIBER_FOODS grouped list with
// category pills, debounced USDA live search (via /api/usda/search), custom
// food form, and the inline gram log panel.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api-base";
import { HIGH_FIBER_FOODS } from "@/lib/constants";
import { calculateFiber, formatFiber } from "@/lib/fiber";
import type { FoodSearchItem } from "@/lib/types";
import Icon from "@/components/Icon";
import FiberLoading from "@/components/FiberLoading";

const CATEGORIES = ["Seeds & Nuts", "Legumes", "Grains", "Fruits", "Vegetables", "Other"];

interface CustomFoodDto {
  id: string;
  name: string;
  fiberPer100g: number;
}

interface UsdaFood {
  fdcId: number;
  name: string;
  brandName?: string;
  fiberPer100g: number;
  servingSizeG?: number;
}

export default function SearchClient({
  customFoods,
  hasUsdaKey,
}: {
  customFoods: CustomFoodDto[];
  hasUsdaKey: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodSearchItem | null>(null);
  const [grams, setGrams] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // USDA search
  const [usdaMode, setUsdaMode] = useState(false);
  const [usdaResults, setUsdaResults] = useState<UsdaFood[]>([]);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [usdaError, setUsdaError] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom food entry
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customFiberStr, setCustomFiberStr] = useState("");
  const [customGramsStr, setCustomGramsStr] = useState("100");

  useEffect(() => {
    if (!usdaMode || !query.trim()) {
      setUsdaResults([]);
      setUsdaError("");
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!hasUsdaKey) {
        setUsdaError("No API key configured.");
        return;
      }
      setUsdaLoading(true);
      setUsdaError("");
      try {
        const res = await fetch(
          `${API_BASE}/api/usda/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "usda_error");
        if (data.disabled) {
          setUsdaError("No API key configured.");
          setUsdaResults([]);
        } else {
          setUsdaResults(data.foods);
        }
      } catch {
        setUsdaError("USDA search failed. Try again.");
        setUsdaResults([]);
      } finally {
        setUsdaLoading(false);
      }
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, usdaMode, hasUsdaKey]);

  const filteredFoods = useMemo(() => {
    if (usdaMode) return [];
    const q = query.toLowerCase().trim();
    let foods = HIGH_FIBER_FOODS;
    if (q) foods = foods.filter((f) => f.name.toLowerCase().includes(q));
    if (activeCategory) foods = foods.filter((f) => f.category === activeCategory);
    const grouped: Record<string, typeof foods> = {};
    for (const food of foods) {
      if (!grouped[food.category]) grouped[food.category] = [];
      grouped[food.category].push(food);
    }
    return CATEGORIES.filter((cat) => grouped[cat]?.length > 0).map((cat) => ({
      title: cat,
      data: [...grouped[cat]].sort((a, b) => b.fiberPer100g - a.fiberPer100g),
    }));
  }, [query, activeCategory, usdaMode]);

  const filteredCustomFoods = useMemo(() => {
    if (usdaMode) return [];
    const q = query.toLowerCase().trim();
    if (!q) return customFoods;
    return customFoods.filter((f) => f.name.toLowerCase().includes(q));
  }, [customFoods, query, usdaMode]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  function handleSelectFood(food: {
    name: string;
    fiberPer100g: number;
    typicalServingG?: number;
  }) {
    setSelectedFood({
      id: `builtin-${food.name}`,
      name: food.name,
      fiberPer100g: food.fiberPer100g,
      typicalServingG: food.typicalServingG,
    });
    setGrams(String(food.typicalServingG ?? 100));
    setErrorMessage("");
    setToastMessage("");
    setShowCustomForm(false);
  }

  function handleSelectUsdaFood(food: UsdaFood) {
    setSelectedFood({
      id: `usda-${food.fdcId}`,
      name: food.name,
      brandName: food.brandName,
      fiberPer100g: food.fiberPer100g,
      servingSizeG: food.servingSizeG,
    });
    setGrams(
      String(food.servingSizeG && food.servingSizeG > 0 ? Math.round(food.servingSizeG) : 100)
    );
    setErrorMessage("");
    setToastMessage("");
    setShowCustomForm(false);
  }

  async function logEntry(foodName: string, fiberPer100g: number, g: number) {
    const res = await fetch(`${API_BASE}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName, fiberPer100g, grams: g }),
    });
    if (!res.ok) {
      setErrorMessage("Couldn't log entry. Try again.");
      return false;
    }
    return true;
  }

  async function handleLog() {
    if (!selectedFood) return;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) {
      setErrorMessage("Please enter a positive number of grams.");
      return;
    }
    if (!(await logEntry(selectedFood.name, selectedFood.fiberPer100g, g))) return;
    const fiber = calculateFiber(selectedFood.fiberPer100g, g);
    showToast(`${selectedFood.name} (${g}g) — ${formatFiber(fiber)} fiber added`);
    setSelectedFood(null);
    setGrams("");
    setErrorMessage("");
    router.refresh();
  }

  function handleCancel() {
    setSelectedFood(null);
    setGrams("");
    setErrorMessage("");
  }

  async function handleLogCustom() {
    const name = customName.trim();
    const fiberPer100g = parseFloat(customFiberStr);
    const g = parseFloat(customGramsStr);
    if (!name) { setErrorMessage("Enter a food name."); return; }
    if (isNaN(fiberPer100g) || fiberPer100g < 0 || fiberPer100g > 100) {
      setErrorMessage("Enter fiber per 100g (0–100).");
      return;
    }
    if (isNaN(g) || g <= 0) { setErrorMessage("Enter a positive gram amount."); return; }

    // Save the custom food for reuse, then log the entry.
    await fetch(`${API_BASE}/api/custom-foods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, fiberPer100g }),
    }).catch(() => {});
    if (!(await logEntry(name, fiberPer100g, g))) return;

    const fiber = calculateFiber(fiberPer100g, g);
    showToast(`${name} (${g}g) — ${formatFiber(fiber)} fiber added`);
    setShowCustomForm(false);
    setCustomName("");
    setCustomFiberStr("");
    setCustomGramsStr("100");
    setErrorMessage("");
    router.refresh();
  }

  return (
    <div>
      {toastMessage !== "" && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-3rem)] max-w-xl -translate-x-1/2 rounded-xl bg-primary p-4 text-center text-sm font-bold text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Header + search */}
      <div className="px-6 pb-2 pt-4">
        <h1 className="mb-3 text-2xl font-extrabold text-ink">Search foods</h1>
        <input
          placeholder={usdaMode ? "Search USDA database..." : "Filter foods..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!usdaMode && e.target.value.length > 0) setActiveCategory(null);
          }}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:border-primary focus:outline-none"
        />

        {/* USDA toggle — only when the server has a key configured */}
        {hasUsdaKey && (
          <button
            type="button"
            onClick={() => {
              setUsdaMode(!usdaMode);
              setSelectedFood(null);
            }}
            className="mt-2 flex items-center gap-2"
          >
            <span
              className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                usdaMode ? "bg-primary justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white" />
            </span>
            <span className="text-[13px] font-semibold text-gray-500">
              USDA live search
            </span>
          </button>
        )}
      </div>

      {/* Category pills — only in built-in mode */}
      {!usdaMode && (
        <div className="flex gap-2 overflow-x-auto px-6 py-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold ${
              activeCategory === null ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                activeCategory === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Inline log panel */}
      {selectedFood && (
        <div className="mx-6 my-2 rounded-2xl border-2 border-primary bg-mintlight p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-base font-bold text-emerald-900">
                {selectedFood.name}
              </div>
              <div className="mt-0.5 text-[13px] text-emerald-700">
                {selectedFood.fiberPer100g.toFixed(1)}g fiber per 100g
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close"
              className="text-xl text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              placeholder="grams"
              value={grams}
              onChange={(e) => { setGrams(e.target.value); setErrorMessage(""); }}
              inputMode="decimal"
              className="flex-1 rounded-lg border border-emerald-100 bg-white px-3.5 py-2.5 text-center text-lg focus:border-primary focus:outline-none"
            />
            <span className="text-[15px] text-gray-500">g</span>
          </div>

          {grams && !isNaN(parseFloat(grams)) && parseFloat(grams) > 0 && (
            <div className="mt-2 text-center text-[15px] font-bold text-primary">
              = {formatFiber(calculateFiber(selectedFood.fiberPer100g, parseFloat(grams)))} fiber
            </div>
          )}

          {errorMessage !== "" && (
            <div className="mt-1.5 text-center text-[13px] text-red-500">{errorMessage}</div>
          )}

          <button
            type="button"
            onClick={handleLog}
            className="mt-3 w-full rounded-lg bg-primary py-3.5 text-[15px] font-bold text-white hover:bg-primarydark"
          >
            Add to today&apos;s log
          </button>
        </div>
      )}

      {/* USDA results */}
      {usdaMode ? (
        <div>
          {usdaLoading && <FiberLoading />}
          {!usdaLoading && usdaError !== "" && (
            <div className="pt-8 text-center text-red-500">{usdaError}</div>
          )}
          {!usdaLoading && usdaError === "" && query.trim() !== "" && usdaResults.length === 0 && (
            <div className="pt-8 text-center">
              <Icon name="wheat" className="mx-auto mb-3 h-10 w-10 text-emerald-200" />
              <div className="text-gray-400">No USDA results found.</div>
            </div>
          )}
          {!usdaLoading && usdaError === "" && query.trim() === "" && (
            <div className="pt-10 text-center">
              <Icon name="wheat" className="mx-auto mb-3 h-10 w-10 text-emerald-200" />
              <div className="whitespace-pre-line text-gray-400">
                {"Type to search the USDA\nFoodData Central database"}
              </div>
            </div>
          )}
          {usdaResults.map((item) => (
            <button
              key={item.fdcId}
              type="button"
              onClick={() => handleSelectUsdaFood(item)}
              className={`flex w-full items-center justify-between border-b border-gray-100 px-6 py-3 text-left hover:bg-mintlight ${
                selectedFood?.id === `usda-${item.fdcId}` ? "bg-mint" : "bg-white"
              }`}
            >
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-ink">{item.name}</div>
                {item.brandName && (
                  <div className="text-xs text-gray-400">{item.brandName}</div>
                )}
              </div>
              <div className="ml-2 text-right">
                <div className="text-[15px] font-bold text-primary">
                  {item.fiberPer100g.toFixed(1)}g
                </div>
                <div className="text-[10px] text-gray-400">per 100g</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Built-in food list */
        <div>
          {filteredCustomFoods.length > 0 && (
            <div>
              <div className="bg-gray-50 px-6 py-2 text-[13px] font-bold uppercase text-gray-500">
                My foods
              </div>
              {filteredCustomFoods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFood({ name: item.name, fiberPer100g: item.fiberPer100g, typicalServingG: 100 })}
                  className={`flex w-full items-center justify-between border-b border-gray-100 px-6 py-3 text-left hover:bg-mintlight ${
                    selectedFood?.id === `builtin-${item.name}` ? "bg-mint" : "bg-white"
                  }`}
                >
                  <div className="flex flex-1 items-center gap-2.5">
                    <Icon name="pencil" className="h-4 w-4 shrink-0 text-gray-300" />
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-ink">{item.name}</div>
                      <div className="text-xs text-gray-400">custom food</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-primary">{item.fiberPer100g}g</div>
                    <div className="text-[10px] text-gray-400">per 100g</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredFoods.map((section) => (
            <div key={section.title}>
              <div className="sticky top-0 bg-gray-50 px-6 py-2 text-[13px] font-bold uppercase text-gray-500">
                {section.title}
              </div>
              {section.data.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectFood(item)}
                  className={`flex w-full items-center justify-between border-b border-gray-100 px-6 py-3 text-left hover:bg-mintlight ${
                    selectedFood?.id === `builtin-${item.name}` ? "bg-mint" : "bg-white"
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold text-ink">{item.name}</div>
                    <div className="text-xs text-gray-400">~{item.typicalServingG}g serving</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-primary">{item.fiberPer100g}g</div>
                    <div className="text-[10px] text-gray-400">per 100g</div>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {filteredFoods.length === 0 && filteredCustomFoods.length === 0 && (
            <div className="pt-10 text-center">
              <Icon name="leaf" className="mx-auto mb-3 h-10 w-10 text-emerald-200" />
              <div className="text-gray-400">No matching foods found.</div>
            </div>
          )}

          <div className="px-6 py-5">
            <button
              type="button"
              onClick={() => {
                setShowCustomForm(!showCustomForm);
                setSelectedFood(null);
                setErrorMessage("");
              }}
              className="w-full rounded-xl border-[1.5px] border-dashed border-primary py-3.5 text-[15px] font-bold text-primary"
            >
              {showCustomForm ? "Cancel custom entry" : "+ Log custom food"}
            </button>

            {showCustomForm && (
              <div className="mt-3 rounded-2xl border-2 border-primary bg-mintlight p-4">
                <div className="mb-3 text-[15px] font-bold text-emerald-900">Custom food</div>

                <div className="mb-1 text-xs text-gray-500">Food name</div>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Homemade granola"
                  className="mb-3 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-[15px] focus:border-primary focus:outline-none"
                />

                <div className="mb-1 text-xs text-gray-500">Fiber per 100g (g)</div>
                <input
                  value={customFiberStr}
                  onChange={(e) => setCustomFiberStr(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 8"
                  className="mb-3 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-[15px] focus:border-primary focus:outline-none"
                />

                <div className="mb-1 text-xs text-gray-500">Serving size (g)</div>
                <input
                  value={customGramsStr}
                  onChange={(e) => setCustomGramsStr(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 100"
                  className="mb-2 w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-[15px] focus:border-primary focus:outline-none"
                />

                {customFiberStr && customGramsStr &&
                  !isNaN(parseFloat(customFiberStr)) && !isNaN(parseFloat(customGramsStr)) &&
                  parseFloat(customGramsStr) > 0 && (
                    <div className="mb-2 text-center text-sm font-bold text-primary">
                      = {formatFiber(calculateFiber(parseFloat(customFiberStr), parseFloat(customGramsStr)))} fiber
                    </div>
                  )}

                {errorMessage !== "" && (
                  <div className="mb-2 text-center text-[13px] text-red-500">{errorMessage}</div>
                )}

                <button
                  type="button"
                  onClick={handleLogCustom}
                  className="w-full rounded-lg bg-primary py-3.5 text-[15px] font-bold text-white hover:bg-primarydark"
                >
                  Log it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
