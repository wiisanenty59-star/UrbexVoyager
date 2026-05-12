/**
 * HiddenFreeways database seed script.
 * Run with: pnpm --filter @workspace/scripts run seed
 *
 * Default mode: adds missing data only (idempotent).
 * Pass --fresh to wipe and re-create everything from scratch.
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import {
  db, usersTable, statesTable, categoriesTable, invitesTable,
  locationsTable, threadsTable, postsTable, chatRoomsTable,
  announcementsTable, siteSettingsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const FRESH = process.argv.includes("--fresh");
const ADMIN_USERNAME = process.env["ADMIN_USERNAME"] ?? "admin";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "ChangeMe!2026";

// ─── All 50 US States ────────────────────────────────────────────────────────
const ALL_STATES = [
  { slug: "alabama",        name: "Alabama",        abbreviation: "AL", centerLat: 32.8,  centerLng: -86.8,  zoom: 7 },
  { slug: "alaska",         name: "Alaska",         abbreviation: "AK", centerLat: 64.2,  centerLng: -153.4, zoom: 4 },
  { slug: "arizona",        name: "Arizona",        abbreviation: "AZ", centerLat: 34.3,  centerLng: -111.1, zoom: 7 },
  { slug: "arkansas",       name: "Arkansas",       abbreviation: "AR", centerLat: 34.8,  centerLng: -92.2,  zoom: 7 },
  { slug: "california",     name: "California",     abbreviation: "CA", centerLat: 36.8,  centerLng: -119.4, zoom: 6 },
  { slug: "colorado",       name: "Colorado",       abbreviation: "CO", centerLat: 39.1,  centerLng: -105.4, zoom: 7 },
  { slug: "connecticut",    name: "Connecticut",    abbreviation: "CT", centerLat: 41.6,  centerLng: -72.7,  zoom: 9 },
  { slug: "delaware",       name: "Delaware",       abbreviation: "DE", centerLat: 39.0,  centerLng: -75.5,  zoom: 9 },
  { slug: "florida",        name: "Florida",        abbreviation: "FL", centerLat: 27.8,  centerLng: -81.8,  zoom: 7 },
  { slug: "georgia",        name: "Georgia",        abbreviation: "GA", centerLat: 32.7,  centerLng: -83.4,  zoom: 7 },
  { slug: "hawaii",         name: "Hawaii",         abbreviation: "HI", centerLat: 20.8,  centerLng: -157.0, zoom: 7 },
  { slug: "idaho",          name: "Idaho",          abbreviation: "ID", centerLat: 44.2,  centerLng: -114.5, zoom: 7 },
  { slug: "illinois",       name: "Illinois",       abbreviation: "IL", centerLat: 40.0,  centerLng: -89.0,  zoom: 7 },
  { slug: "indiana",        name: "Indiana",        abbreviation: "IN", centerLat: 39.9,  centerLng: -86.3,  zoom: 7 },
  { slug: "iowa",           name: "Iowa",           abbreviation: "IA", centerLat: 41.9,  centerLng: -93.5,  zoom: 7 },
  { slug: "kansas",         name: "Kansas",         abbreviation: "KS", centerLat: 38.5,  centerLng: -98.4,  zoom: 7 },
  { slug: "kentucky",       name: "Kentucky",       abbreviation: "KY", centerLat: 37.7,  centerLng: -85.0,  zoom: 7 },
  { slug: "louisiana",      name: "Louisiana",      abbreviation: "LA", centerLat: 30.5,  centerLng: -92.1,  zoom: 7 },
  { slug: "maine",          name: "Maine",          abbreviation: "ME", centerLat: 45.3,  centerLng: -69.1,  zoom: 7 },
  { slug: "maryland",       name: "Maryland",       abbreviation: "MD", centerLat: 38.9,  centerLng: -77.0,  zoom: 8 },
  { slug: "massachusetts",  name: "Massachusetts",  abbreviation: "MA", centerLat: 42.2,  centerLng: -71.5,  zoom: 8 },
  { slug: "michigan",       name: "Michigan",       abbreviation: "MI", centerLat: 44.3,  centerLng: -85.6,  zoom: 6 },
  { slug: "minnesota",      name: "Minnesota",      abbreviation: "MN", centerLat: 46.3,  centerLng: -94.3,  zoom: 6 },
  { slug: "mississippi",    name: "Mississippi",    abbreviation: "MS", centerLat: 32.7,  centerLng: -89.7,  zoom: 7 },
  { slug: "missouri",       name: "Missouri",       abbreviation: "MO", centerLat: 38.5,  centerLng: -92.5,  zoom: 7 },
  { slug: "montana",        name: "Montana",        abbreviation: "MT", centerLat: 47.0,  centerLng: -110.4, zoom: 6 },
  { slug: "nebraska",       name: "Nebraska",       abbreviation: "NE", centerLat: 41.5,  centerLng: -99.8,  zoom: 7 },
  { slug: "nevada",         name: "Nevada",         abbreviation: "NV", centerLat: 38.5,  centerLng: -117.0, zoom: 7 },
  { slug: "new-hampshire",  name: "New Hampshire",  abbreviation: "NH", centerLat: 43.7,  centerLng: -71.6,  zoom: 8 },
  { slug: "new-jersey",     name: "New Jersey",     abbreviation: "NJ", centerLat: 40.1,  centerLng: -74.5,  zoom: 9 },
  { slug: "new-mexico",     name: "New Mexico",     abbreviation: "NM", centerLat: 34.3,  centerLng: -106.0, zoom: 7 },
  { slug: "new-york",       name: "New York",       abbreviation: "NY", centerLat: 42.9,  centerLng: -75.6,  zoom: 7 },
  { slug: "north-carolina", name: "North Carolina", abbreviation: "NC", centerLat: 35.5,  centerLng: -79.4,  zoom: 7 },
  { slug: "north-dakota",   name: "North Dakota",   abbreviation: "ND", centerLat: 47.5,  centerLng: -100.3, zoom: 7 },
  { slug: "ohio",           name: "Ohio",           abbreviation: "OH", centerLat: 40.4,  centerLng: -82.7,  zoom: 7 },
  { slug: "oklahoma",       name: "Oklahoma",       abbreviation: "OK", centerLat: 35.6,  centerLng: -97.5,  zoom: 7 },
  { slug: "oregon",         name: "Oregon",         abbreviation: "OR", centerLat: 44.0,  centerLng: -120.5, zoom: 7 },
  { slug: "pennsylvania",   name: "Pennsylvania",   abbreviation: "PA", centerLat: 40.9,  centerLng: -77.8,  zoom: 7 },
  { slug: "rhode-island",   name: "Rhode Island",   abbreviation: "RI", centerLat: 41.7,  centerLng: -71.5,  zoom: 10 },
  { slug: "south-carolina", name: "South Carolina", abbreviation: "SC", centerLat: 33.8,  centerLng: -81.2,  zoom: 8 },
  { slug: "south-dakota",   name: "South Dakota",   abbreviation: "SD", centerLat: 44.3,  centerLng: -100.2, zoom: 7 },
  { slug: "tennessee",      name: "Tennessee",      abbreviation: "TN", centerLat: 35.9,  centerLng: -86.3,  zoom: 7 },
  { slug: "texas",          name: "Texas",          abbreviation: "TX", centerLat: 31.5,  centerLng: -99.3,  zoom: 6 },
  { slug: "utah",           name: "Utah",           abbreviation: "UT", centerLat: 39.3,  centerLng: -111.1, zoom: 7 },
  { slug: "vermont",        name: "Vermont",        abbreviation: "VT", centerLat: 44.0,  centerLng: -72.7,  zoom: 8 },
  { slug: "virginia",       name: "Virginia",       abbreviation: "VA", centerLat: 37.8,  centerLng: -79.5,  zoom: 7 },
  { slug: "washington",     name: "Washington",     abbreviation: "WA", centerLat: 47.4,  centerLng: -120.5, zoom: 7 },
  { slug: "west-virginia",  name: "West Virginia",  abbreviation: "WV", centerLat: 38.6,  centerLng: -80.6,  zoom: 8 },
  { slug: "wisconsin",      name: "Wisconsin",      abbreviation: "WI", centerLat: 44.5,  centerLng: -89.5,  zoom: 7 },
  { slug: "wyoming",        name: "Wyoming",        abbreviation: "WY", centerLat: 43.1,  centerLng: -107.3, zoom: 7 },
];

// ─── Categories + sub-categories ─────────────────────────────────────────────
const CATEGORIES = [
  {
    slug: "trip-reports", name: "Trip Reports", icon: "compass", sortOrder: 10,
    description: "Full writeups of your urbex adventures — what you found, what happened, and what to watch for.",
    subs: [
      { slug: "trip-reports-usa",           name: "USA",               description: "Domestic US trip reports.", sortOrder: 1 },
      { slug: "trip-reports-international", name: "International",     description: "Reports from outside the US.", sortOrder: 2 },
    ],
  },
  {
    slug: "location-intel", name: "Location Intel", icon: "map-pin", sortOrder: 20,
    description: "Site information, access conditions, security updates, and current status reports.",
    subs: [
      { slug: "location-intel-industrial", name: "Industrial",          description: "Factories, plants, and mills.", sortOrder: 1 },
      { slug: "location-intel-tunnels",    name: "Tunnels",             description: "Storm drains, transit tunnels.", sortOrder: 2 },
      { slug: "location-intel-buildings",  name: "Abandoned Buildings", description: "Hospitals, asylums, offices.", sortOrder: 3 },
      { slug: "location-intel-rural",      name: "Rural & Outdoors",    description: "Farms, bridges, rural infrastructure.", sortOrder: 4 },
    ],
  },
  {
    slug: "scouting", name: "Scouting & Tips", icon: "binoculars", sortOrder: 30,
    description: "Help identifying, locating, and accessing places. Route planning, satellite recon.",
    subs: [],
  },
  {
    slug: "safety", name: "Safety & Gear", icon: "shield-alert", sortOrder: 40,
    description: "Equipment reviews, PPE, safety protocols, and harm reduction. Stay safe out there.",
    subs: [],
  },
  {
    slug: "photography-media", name: "Photography & Media", icon: "camera", sortOrder: 50,
    description: "Urbex photography, gear, post-processing, videography, and media sharing.",
    subs: [],
  },
  {
    slug: "history", name: "The Archives", icon: "scroll-text", sortOrder: 60,
    description: "Historical research, documentation, and preservation of forgotten places.",
    subs: [],
  },
  {
    slug: "meet-greet", name: "Meet & Greet", icon: "users", sortOrder: 70,
    description: "Introduce yourself, find crew members, and connect with operatives in your area.",
    subs: [],
  },
  {
    slug: "general", name: "General Discussion", icon: "message-square", sortOrder: 80,
    description: "Open conversation not directly related to urban exploration.",
    subs: [],
  },
];

// ─── Site Settings ────────────────────────────────────────────────────────────
const SITE_SETTINGS = [
  {
    key: "welcome_message",
    value: "Welcome to HiddenFreeways — the underground network for urban explorers. Stay safe, leave no trace, and respect the community.",
  },
  {
    key: "guidelines",
    value: `COMMUNITY GUIDELINES

1. OPSEC FIRST — Never share active access points publicly. Use coded language or DMs for sensitive info.
2. NO DOXXING — Do not share real names, addresses, or identifying information of other members.
3. RESPECT THE SPACE — Leave what you find. Document, don't damage.
4. NO DRAMA — Keep personal beef out of the forums. Handle it in DMs.
5. CREW PROTOCOL — Only Honored members (Trust Level 2+) can form crews. Earn your rank.
6. INVITE ONLY — This community is invite-only. Do not share invite links publicly.
7. TRUST THE PROCESS — Trust is earned through trip reports, contributions, and good conduct.`,
  },
  {
    key: "rules",
    value: `OPERATIONAL RULES

- Always scout before you enter.
- Never go alone on a first visit to an unknown location.
- Carry: flashlight, mask (N95+), gloves, first aid kit, phone with offline maps.
- Do not post active locations in public threads. Use the Crews system.
- Report suspicious behavior to admins immediately.
- Photos and video are encouraged — tag your posts with the location if it is safe to do so.`,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 HiddenFreeways seed — mode: ${FRESH ? "FRESH (wipe)" : "additive"}\n`);

  if (FRESH) {
    console.log("  Wiping existing data...");
    for (const t of [
      "admin_notices", "crew_members", "crews", "room_messages", "chat_rooms",
      "votes", "posts", "threads", "locations", "categories",
      "states", "invites", "announcements", "site_settings", "users",
    ]) {
      await db.execute(sql.raw(`TRUNCATE "${t}" RESTART IDENTITY CASCADE`));
    }
    console.log("  ✓ Tables cleared\n");
  }

  // ── Admin user ──────────────────────────────────────────────────────────────
  const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.username, ADMIN_USERNAME));
  let adminId: number;
  if (existingAdmin) {
    adminId = existingAdmin.id;
    console.log(`  ✓ Admin "${ADMIN_USERNAME}" already exists (id=${adminId})`);
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const [admin] = await db.insert(usersTable).values({ username: ADMIN_USERNAME, passwordHash: hash, role: "admin", trustLevel: 5 }).returning();
    if (!admin) throw new Error("Could not create admin");
    adminId = admin.id;
    console.log(`  ✓ Created admin "${ADMIN_USERNAME}" (password: ${ADMIN_PASSWORD})`);
  }

  // ── Sample invite ──────────────────────────────────────────────────────────
  const [inviteCount] = await db.select({ c: sql<number>`count(*)::int` }).from(invitesTable);
  if (!inviteCount || inviteCount.c === 0) {
    const code = randomBytes(8).toString("hex");
    await db.insert(invitesTable).values({ code, note: "Founder invite — share with first crew", createdById: adminId });
    console.log(`  ✓ Invite code: ${code}`);
  }

  // ── All 50 states ──────────────────────────────────────────────────────────
  let statesAdded = 0;
  for (const s of ALL_STATES) {
    const [existing] = await db.select({ id: statesTable.id }).from(statesTable).where(eq(statesTable.slug, s.slug));
    if (!existing) {
      await db.insert(statesTable).values(s);
      statesAdded++;
    }
  }
  const [stateTotal] = await db.select({ c: sql<number>`count(*)::int` }).from(statesTable);
  console.log(`  ✓ States: ${stateTotal?.c ?? 0} total (${statesAdded} added)`);

  // ── Categories + sub-categories ────────────────────────────────────────────
  let catsAdded = 0;
  for (const cat of CATEGORIES) {
    const { subs, ...catData } = cat;
    const [existing] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, catData.slug));
    let parentId: number;
    if (existing) {
      parentId = existing.id;
    } else {
      const [created] = await db.insert(categoriesTable).values(catData).returning();
      if (!created) continue;
      parentId = created.id;
      catsAdded++;
    }
    for (const sub of subs) {
      const [existingSub] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, sub.slug));
      if (!existingSub) {
        await db.insert(categoriesTable).values({ ...sub, parentId, icon: null });
        catsAdded++;
      }
    }
  }
  const [catTotal] = await db.select({ c: sql<number>`count(*)::int` }).from(categoriesTable);
  console.log(`  ✓ Categories: ${catTotal?.c ?? 0} total (${catsAdded} added)`);

  // ── Chat rooms ─────────────────────────────────────────────────────────────
  const chatRooms = [
    { slug: "lobby",        name: "Lobby",        description: "General chatter for everyone.", kind: "public",  minTrustLevel: 0 },
    { slug: "field-talk",   name: "Field Talk",   description: "Live conditions, gear, last-minute pings.", kind: "public", minTrustLevel: 0 },
    { slug: "trusted-only", name: "Trusted Only", description: "Verified operatives only. Real intel.", kind: "trusted", minTrustLevel: 2 },
  ];
  for (const r of chatRooms) {
    const [existing] = await db.select({ id: chatRoomsTable.id }).from(chatRoomsTable).where(eq(chatRoomsTable.slug, r.slug));
    if (!existing) await db.insert(chatRoomsTable).values(r);
  }
  console.log("  ✓ Chat rooms ready");

  // ── Site settings ──────────────────────────────────────────────────────────
  for (const s of SITE_SETTINGS) {
    await db.insert(siteSettingsTable).values({ key: s.key, value: s.value })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: s.value } });
  }
  console.log("  ✓ Site settings written");

  // ── Welcome announcement ───────────────────────────────────────────────────
  const [annCount] = await db.select({ c: sql<number>`count(*)::int` }).from(announcementsTable);
  if (!annCount || annCount.c === 0) {
    await db.insert(announcementsTable).values({
      title: "Welcome to HiddenFreeways",
      body: "Invite-only. Be careful what you post — every location you burn stays burnt.",
      kind: "info", priority: 10, createdById: adminId,
    });
  }

  // ── Welcome thread ─────────────────────────────────────────────────────────
  const [threadCount] = await db.select({ c: sql<number>`count(*)::int` }).from(threadsTable);
  if (!threadCount || threadCount.c === 0) {
    const [tripCat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "meet-greet"));
    if (tripCat) {
      const [thread] = await db.insert(threadsTable).values({
        title: "Welcome to HiddenFreeways",
        body: "[b]Welcome.[/b]\n\nThis is a private network for urban explorers.\n\nGround rules:\n- Don't burn locations.\n- Trade real intel, not hype.\n- Take only photos. Leave only footprints.\n- Respect your crew.\n\nPost trip reports, location intel, and history. Earn trust. Form a crew.\n\n[i]— Admin[/i]",
        categoryId: tripCat.id,
        authorId: adminId,
        isPinned: true,
      }).returning();
      if (thread) {
        await db.insert(postsTable).values({ threadId: thread.id, authorId: adminId, body: "If you can read this, you're in. Welcome aboard." });
        await db.update(threadsTable).set({ replyCount: 1, lastActivityAt: new Date() }).where(eq(threadsTable.id, thread.id));
      }
    }
    console.log("  ✓ Welcome thread created");
  }

  // ── Sample locations ───────────────────────────────────────────────────────
  const [locCount] = await db.select({ c: sql<number>`count(*)::int` }).from(locationsTable);
  if (!locCount || locCount.c === 0) {
    const [illinois] = await db.select().from(statesTable).where(eq(statesTable.slug, "illinois"));
    const [ohio] = await db.select().from(statesTable).where(eq(statesTable.slug, "ohio"));
    const [tripCat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, "trip-reports"));
    if (illinois) {
      await db.insert(locationsTable).values({
        stateId: illinois.id, name: "Damen Silos", city: "Chicago",
        description: "Concrete grain elevators on the south branch of the Chicago River. Heavily watched, recently sold for redevelopment.",
        latitude: 41.8458, longitude: -87.6648, status: "watched", risk: "high", createdById: adminId,
      });
    }
    if (ohio) {
      await db.insert(locationsTable).values({
        stateId: ohio.id, name: "Ohio State Reformatory", city: "Mansfield",
        description: "Historic Victorian Gothic prison, filming location for Shawshank Redemption. Now a museum with some restricted access areas.",
        latitude: 40.7648, longitude: -82.5157, status: "active", risk: "low", createdById: adminId,
      });
    }
    const [damagedLoc] = await db.select().from(locationsTable).limit(1);
    if (damagedLoc && tripCat) {
      const [t] = await db.insert(threadsTable).values({
        title: "Damen Silos — July Scouting Run",
        body: "[b]Status:[/b] Watched. Motion cams on the river side.\n\n[img]https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Damen_Silos_Chicago.jpg/640px-Damen_Silos_Chicago.jpg[/img]\n\nApproach from the south. Don't linger near the fence. Best access window is pre-dawn. Bring a respirator — heavy asbestos risk on upper floors.",
        categoryId: tripCat.id, locationId: damagedLoc.id, authorId: adminId,
      }).returning();
      if (t) await db.update(threadsTable).set({ lastActivityAt: new Date() }).where(eq(threadsTable.id, t.id));
    }
    console.log("  ✓ Sample locations + threads created");
  }

  console.log(`\n✅ Seed complete!\n`);
  console.log(`   Admin: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
