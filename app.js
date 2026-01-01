function $(sel) { return document.querySelector(sel); }
function getParam(name) { return new URLSearchParams(location.search).get(name) || ""; }

function matchesQuery(cosplayer, q) {
  if (!q) return true;
  q = q.toLowerCase();
  const hay = [
    cosplayer.name,
    ...cosplayer.portfolio.flatMap(p => p.tags),
    cosplayer.availability.location || ""
  ].join(" ").toLowerCase();
  return hay.includes(q);
}

function renderGrid(list) {
  const grid = $("#grid");
  if (!grid) return;

  grid.innerHTML = list.map(c => {
    const showVirtual = !!c.availability?.virtual;
    const showInPerson = !!c.availability?.inPerson;
    const city = c.availability?.location || "";

    // Build overlay badges (only show location with In-person)
    const badges = [
      showVirtual ? `<span class="badge badgeVirtual">💻 Virtual</span>` : "",
      showInPerson
        ? `<span class="badge badgeInPerson">🌍 In-person${city ? ` · 📍 ${city}` : ""}</span>`
        : ""
    ].filter(Boolean).join("");

    return `
      <a class="card" href="profile.html?id=${encodeURIComponent(c.id)}">
        <div class="cardMedia">
          <img src="${c.coverImage}" alt="${c.name}" />
          ${badges ? `<div class="cardBadges">${badges}</div>` : ``}
        </div>

        <div class="cardBody">
          <div class="row">
            <div class="name" title="${c.name}">${c.name}</div>
            <div class="rate">$${c.rate}/hr</div>
          </div>
        </div>
      </a>
    `;
  }).join("");
}



function initHome() {
  const form = $("#searchForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#q").value.trim();
    location.href = `browse.html?q=${encodeURIComponent(q)}`;
  });
}

function initBrowse() {
// Force clean defaults (prevents browser restoring checkbox state)
$("#fVirtual") && ($("#fVirtual").checked = false);
$("#fInPerson") && ($("#fInPerson").checked = false);
$("#fMaxRate") && ($("#fMaxRate").value = "");

  const q = getParam("q");
  const locQ = getParam("loc");
  const input = $("#q");
  if (input) input.value = q;
  const locInput = $("#loc");
  if (locInput) locInput.value = locQ;

  function apply() {
    const q2 = $("#q")?.value.trim() || "";
    const loc = $("#loc")?.value.trim() || "";
    const wantVirtual = $("#fVirtual")?.checked || false;
    const wantInPerson = $("#fInPerson")?.checked || false;
    const maxRate = Number($("#fMaxRate")?.value || 0);

    let list = window.COSPLAYERS.filter(c => matchesQuery(c, q2));

    // OR logic for service type
    if (wantVirtual || wantInPerson) {
      list = list.filter(c =>
        (wantVirtual && c.availability.virtual) ||
        (wantInPerson && c.availability.inPerson)
      );
    }

    if (maxRate > 0) list = list.filter(c => c.rate <= maxRate);

    // Location is only meaningful for in-person listings.
    if (loc) {
      const locLower = loc.toLowerCase();
      list = list.filter(c =>
        c.availability.inPerson &&
        (c.availability.location || "").toLowerCase().includes(locLower)
      );
    }

    renderGrid(list);
  }

  // Bind once (NOT inside apply)
  document.getElementById("browseForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
  });

  $("#applyBtn")?.addEventListener("click", apply);
  $("#q")?.addEventListener("keydown", (e) => { if (e.key === "Enter") apply(); });
  $("#loc")?.addEventListener("keydown", (e) => { if (e.key === "Enter") apply(); });

  apply();
}


function initProfile() {
  const id = getParam("id");
  const c = window.COSPLAYERS.find(x => x.id === id);
  if (!c) { $("#profile")?.replaceChildren(document.createTextNode("Cosplayer not found.")); return; }

  $("#name").textContent = c.name;
  $("#rate").textContent = `$${c.rate}/hr`;
    const parts = [];
    if (c.availability.virtual) parts.push("💻 Virtual");
    if (c.availability.inPerson) parts.push("🌍 In-person");
    if (c.availability.inPerson && c.availability.location) parts.push(`📍 ${c.availability.location}`);
    $("#availability").textContent = parts.join(" · ") || "—";


  $("#stats").textContent = `${c.completedCount} completed · ${c.responseTime}`;
  if (c.isDemo) $("#stats").textContent = "Demo profile";

  $("#bPublic").textContent = c.boundaries.publicOnly ? "✅ Public spaces only" : "—";
  $("#bTouch").textContent = c.boundaries.noTouch ? "🚫 No physical contact" : "—";
  $("#bCustom").textContent = c.boundaries.customRequests ? "✅ Accepts new characters / custom requests" : "—";

  const contacts = $("#contacts");
  contacts.innerHTML = "";
  Object.entries(c.contact).forEach(([k, v]) => {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = v;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = `Contact via ${k}`;
    contacts.appendChild(a);
  });

  $("#gallery").innerHTML = c.portfolio.map(p => `
    <div class="shot">
      <img src="${p.image}" alt="" />
      <div class="tags">${p.tags.map(t => `#${t}`).join(" ")}</div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initBrowse();
  initProfile();
});
