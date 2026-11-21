# Melges 24 for sale on Italian general classifieds (Subito.it and others), checked 2026-11-21

Method note: this round, unlike the earlier one, **Subito.it loaded normally** in the pre-installed headless Chromium (Playwright, default settings, no user-agent or header changes). The search page and each ad page returned HTTP 200. Plain `curl` still got 403. Ad data comes from two places: the rendered page text, and the page's own embedded JSON (`__NEXT_DATA__`), which gives each ad's exact timestamp, region, the "Iva esposta" (VAT shown) field and a company/private flag. Everything in the per-boat records under Q1 was **opened first-hand on 2026-11-21**. Items marked "snippet only" come from search-engine snippets or from the earlier notes (`../Eladó Melges 24 hajók Európában/western_southern_nordic_classifieds.md`) and were not opened.

Privacy: the ads include sellers' first names, mobile numbers and in one case an e-mail address. I deliberately left these out. Contact details are on each ad page.

## Q1. Which Melges 24 ads are on Subito.it right now (per-boat, with individual ad URLs)?

### Takeaway
On 2026-11-21 Subito.it has **5 active Melges 24 boat ads**, all from private sellers and all posted or last updated between February and May 2026:
- **IT-S1:** 1993 US hull, Laveno-Mombello (Lake Maggiore), €12,500.
- **IT-S2:** 2008 Devoti, hull 764, Ancona, €26,500.
- **IT-S3:** 2011 Devoti, ITA 821, Trieste, €45,000.
- **IT-S4:** 2005 Melges USA, ITA 636, Trieste, €35,000.
- **IT-S5:** Pescara, €16,500.

The Subito search for "melges 24" returns only 7 results in total. The other 2 are not Melges 24 boats: an Ultimate 30 and an Este 24 cradle.

### Cited Findings

**Subito search results (opened 2026-11-21)**
- The Nautica search for "melges 24" (sorted newest first) shows **"7 risultati"** (7 results):
  - 5 Melges 24 boats: Laveno-Mombello €12,500, Ancona €26,500, Trieste €45,000, Trieste €35,000, Pescara €16,500.
  - 1 "Barca a vela ultimate 30 regata/crociera" in Sesto Calende at €33,000. Its text mentions a "Jennaker del melges 32", so it is not a Melges 24.
  - 1 "Invaso barca vela cabinato este 24 carrello" (a cradle) in Dongo at €600.
  - [Subito Nautica "melges 24"](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24)
- Wider searches find no further Melges 24 boats:
  - "melges" in Nautica (10 results). The only extra boat is a Melges 32 in Trieste at €65,500, posted 2026-02-11. — [Subito Nautica "melges"](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges)
  - "melges" across all used-goods categories (11 results). — [Subito usato "melges"](https://www.subito.it/annunci-italia/vendita/usato/?q=melges)
  - "melges24" (2 results, the two Trieste boats). — [Subito Nautica "melges24"](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges24)
  - Title-only search (`qso=true`): 5 results, the same 5 boats. — [Subito title-only](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24&qso=true)

**IT-S1: Melges 24, Laveno-Mombello (VA), Lombardia (Lake Maggiore), €12,500**
- Ad: [subito.it/nautica/melges-24-varese-647481609.htm](https://www.subito.it/nautica/melges-24-varese-647481609.htm), ID 647481609, title "MELGES 24".
- Date: page shows "18 mag alle 09:51"; JSON timestamp 2026-05-18 09:51:57.
- Description, in full: "Melges 24 ancora in buone condizioni, scafo americano secondo melges arrivata in italia nel 1993 completa di vele per regata e allenamento". In English: still in good condition, a US-built hull, the second Melges to arrive in Italy, in 1993, with racing and training sails.
- Not stated in the ad: sail number, mast type, outboard, trailer, sail years.
- Data fields: sailboat, length 7 m, "Iva esposta: No" (no VAT shown).
- Seller: private (JSON `company: false`). Profile says "Pubblica da maggio 2026" (posting since May 2026), 2 ads published, 2 online.
- Status: active on 2026-11-21.

**IT-S2: Melges 24, 2008, built by Devoti, hull no. 764, Ancona (AN), Marche, €26,500 ("leggermente trattabile", slightly negotiable)**
- Ad: [subito.it/nautica/melges-24-barca-regata-ancona-640926455.htm](https://www.subito.it/nautica/melges-24-barca-regata-ancona-640926455.htm), ID 640926455, title "melges 24 barca regata".
- Date: page shows "26 mar alle 11:09"; JSON timestamp 2026-03-26 11:09:10.
- Equipment:
  - black carbon mast ("Albero carbonio nero")
  - outboard motor
  - road trailer, already inspected ("carrello stradale già revisionato")
  - all running rigging optimised for class racing
  - many spare and training parts
  - a full equipment list is available on request
- Sail inventory: not itemised.
- Data fields: sailboat, length 7 m. The VAT field is not filled in.
- Seller: private (`company: false`). Profile "Pubblica da dicembre 2021" (posting since December 2021), rating 5.0.
- Status: active on 2026-11-21.

**IT-S3: Melges 24 ITA 821, 2011, built by Devoti Performance (Czech Republic), Trieste (TS), Friuli-Venezia Giulia, €45,000**
- Ad: [subito.it/nautica/melges-24-trieste-638052101.htm](https://www.subito.it/nautica/melges-24-trieste-638052101.htm), ID 638052101.
- Date: page shows "4 mar alle 17:55"; JSON timestamp 2026-03-04 17:55:44.
- Ad text: "Condizioni ottime e completa di tutto per le competizioni di circuito. Fornita di tutti gli upgrade, accessori, coperture, rimorchio, motore, vele e molto altro... Visibile a Trieste." In English: excellent condition, fully equipped for circuit racing, with all upgrades, accessories, covers, trailer, motor, sails and more; viewable in Trieste.
- Not stated in the ad: mast make, sail list or years.
- Data fields: sailboat only. The VAT field is not filled in.
- Seller: private (`company: false`). Profile:
  - posting since May 2012
  - 73 ads published, 2 online
  - "7 affari conclusi" (7 completed deals)
  - rating 4.9, "usually replies within 3 hours"
  - last access "9 ore fa" (9 hours ago)
- Status: active on 2026-11-21.

**IT-S4: Melges 24 ITA 636, 2005, built in the USA by Melges Performance, Trieste (TS), Friuli-Venezia Giulia, €35,000**
- Ad: [subito.it/nautica/melges-24-trieste-638047790.htm](https://www.subito.it/nautica/melges-24-trieste-638047790.htm), ID 638047790.
- Date: page shows "4 mar alle 17:27"; JSON timestamp 2026-03-04 17:27:52.
- Ad text: "Vendo famoso Melges24 ITA636 ... Con un palmarès di vittorie e piazzamenti in numerosi eventi e campionati." In English: the "famous" ITA 636, with a record of wins and podiums in many events and championships.
- Condition and equipment: the ad otherwise uses the same wording as ITA 821 (excellent condition, all upgrades, covers, trailer, motor, sails; viewable in Trieste).
- Seller: private, the **same seller as ITA 821** (same Subito user ID in the JSON, same profile).
- Status: active on 2026-11-21.

**IT-S5: Melges 24, Pescara (PE), Abruzzo, €16,500**
- Ad: [subito.it/nautica/melges-24-pescara-637450010.htm](https://www.subito.it/nautica/melges-24-pescara-637450010.htm), ID 637450010.
- Date: page shows "28 feb alle 08:09"; JSON timestamp 2026-02-28 08:09:15.
- Equipment:
  - road trailer, inspected and roadworthy ("revisionato e perfettamente marciante")
  - two complete sail sets: a North Sails training set ("serie gialla", yellow series) and an Olimpic Sails race set "come nuovo" (like new)
  - new shrouds, some new sheets and halyards
  - further training sails
  - optional cradle ("eventuale invaso")
- Not stated in the ad: sail number, year, builder, mast type, outboard.
- Data fields: sailboat, 7 m, "Iva esposta: No".
- Seller: private (`company: false`). Profile: posting since August 2012, 61 ads published, 1 online, 2 completed deals.
- Status: active on 2026-11-21.

**Melges 24 accessories currently on Subito (not boats)**
- "Melges 24 Tack Deflector", new, €24, Angera (VA), posted 2026-10-07. — [Subito ad 663694183](https://www.subito.it/sport/melges-24-tack-deflector-varese-663694183.htm) (seen in the search results; I did not open the ad page)

**Summary table: active Subito Melges 24 boats on 2026-11-21 (all opened first-hand)**

| ID | Sail / hull no. | Year | Builder | Price | VAT field | Town (prov.), region | Seller | Subito date | URL |
|---|---|---|---|---|---|---|---|---|---|
| IT-S1 | n/s | 1993 (US hull, "2nd Melges in Italy") | Melges USA (implied by "scafo americano") | €12,500 | Iva esposta: No | Laveno-Mombello (VA), Lombardia | private | 2026-05-18 | https://www.subito.it/nautica/melges-24-varese-647481609.htm |
| IT-S2 | hull 764 | 2008 | Devoti | €26,500 (slightly negotiable) | not filled | Ancona (AN), Marche | private | 2026-03-26 | https://www.subito.it/nautica/melges-24-barca-regata-ancona-640926455.htm |
| IT-S3 | ITA 821 | 2011 | Devoti Performance (CZ) | €45,000 | not filled | Trieste (TS), Friuli-Venezia Giulia | private | 2026-03-04 | https://www.subito.it/nautica/melges-24-trieste-638052101.htm |
| IT-S4 | ITA 636 | 2005 | Melges Performance (USA) | €35,000 | not filled | Trieste (TS), Friuli-Venezia Giulia | private (same seller as IT-S3) | 2026-03-04 | https://www.subito.it/nautica/melges-24-trieste-638047790.htm |
| IT-S5 | n/s | n/s | n/s | €16,500 | Iva esposta: No | Pescara (PE), Abruzzo | private | 2026-02-28 | https://www.subito.it/nautica/melges-24-pescara-637450010.htm |

n/s = not stated in the ad.

### Inferences
- **Price range of live Italian private ads:** €12,500 for a 1993 early hull to €45,000 for a 2011 Devoti. The median is €26,500.
- **Pricing by builder and age:** the two Trieste boats from one seller show how the market prices them: about €10k more for a 2011 Devoti than for a 2005 US-built boat with a strong race record.
- **VAT:** all five sellers are private, so no VAT is charged or reclaimable. "Iva esposta: No" on IT-S1 and IT-S5 means no VAT is shown separately. On the other three the field was simply left blank. This is an inference from the private status, not something the ads state.
- **Ancona boat (IT-S2):** this is very likely the same boat as the earlier snippet lead "2008 Devoti, hull 764, Trieste area, available after the Trieste Worlds". The current ad (March 2026) is in Ancona and no longer mentions Trieste. The likeliest explanation is that a 2025 ad was withdrawn and the boat relisted in 2026 under a new ID.
- **Earlier "Sesto Calende" lead:** the "Sesto Calende, price not captured" lead in the earlier notes was almost certainly the Ultimate 30 ad (€33,000), which matches "melges" only because its text mentions a Melges 32 gennaker. It was a false positive.
- **Hull year of IT-S1:** "secondo melges arrivata in Italia nel 1993" (the second Melges to arrive in Italy, in 1993) points to a very early hull, consistent with production starting in 1993 ([Wikipedia](https://en.wikipedia.org/wiki/Melges_24)).

### Gaps
- No sail number for IT-S1 or IT-S5, no year or builder for IT-S5, and no itemised sail inventory with years in any of the five ads. IT-S2 offers an equipment list on request.
- I found no race record for ITA 636 or ITA 821 through web search, so the "famous" and "palmarès" claims for ITA 636 are unverified.
- Subito's displayed date can be either the original publication or the latest edit or repost. Subito does not show which, so "posted" dates may really be "last updated" dates.

## Q2. Which of the earlier leads are still active, and when were they posted (2025 post-Worlds wave vs. 2026)?

### Takeaway
All five live ads carry 2026 dates (February to May 2026). Of the roughly 15 earlier snippet leads, only four map onto live ads: ITA 636, ITA 821, hull 764 (now in Ancona) and the Laveno-Mombello and Pescara boats. The others are **no longer on Subito as of 2026-11-21**: ITA 528 Monfalcone, ITA 454 Trieste, ITA 501 Padova, ITA 598 Lake Maggiore, Bari, Chioggia, Pieve di Soligo, Faenza and Trieste €16,000. They should be treated as removed, expired or sold, and used only as price references. I could not recover individual URLs for any of them.

### Cited Findings
- **Live (matched to earlier leads):**
  - ITA 636 (Trieste, €35k) is [ad 638047790](https://www.subito.it/nautica/melges-24-trieste-638047790.htm), dated 2026-03-04.
  - ITA 821 (Trieste, €45k) is [ad 638052101](https://www.subito.it/nautica/melges-24-trieste-638052101.htm), dated 2026-03-04.
  - Hull 764, 2008 Devoti is [ad 640926455](https://www.subito.it/nautica/melges-24-barca-regata-ancona-640926455.htm), now in Ancona at €26,500, dated 2026-03-26.
  - Laveno-Mombello €12,500 is [ad 647481609](https://www.subito.it/nautica/melges-24-varese-647481609.htm), dated 2026-05-18.
  - Pescara €16,500 is [ad 637450010](https://www.subito.it/nautica/melges-24-pescara-637450010.htm), dated 2026-02-28.
  - The Ancona €26,500 lead is the same ad as hull 764.
- **No longer listed:** none of the following appear in any Subito search on 2026-11-21 ("melges 24", "melges", "melges24", Nautica and all-categories). — [Subito Nautica "melges 24"](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [Subito usato "melges"](https://www.subito.it/annunci-italia/vendita/usato/?q=melges)
  - **ITA 528, Monfalcone (GO), €21,000.**
    - Equipment: Southern Spars carbon mast, three sail sets, Honda 2.3 hp outboard, trailer; viewable at the Adriaco yard. Snippet only.
    - Age: the earlier snippet called the ad about 466 days old, which suggests mid-2025 (uncertain).
    - Source: [Subito search (snippet, recorded in the earlier notes)](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24)
  - **ITA 501 "ForeverG", Padova (PD), €22,000.**
    - Equipment: North Sails 3Di set, two gennakers and other sails. Snippet only.
    - Age: snippet metadata of about 466 days, which suggests 2025.
    - Class records list "Forever G ITA501" with owner Mirco Pittarello.
    - Sources: [Subito search (snippet)](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [melges24.com – Mirco Pittarello](https://www.melges24.com/mirco-pittarello)
  - **ITA 454 "Skorpios", Trieste, €25,000.** Snippet date "10 mar", year unknown (2025 or 2026). Gone by 2026-11-21. The boat raced Trieste European Sailing Series events in 2022–2023. — [melges24.com 2023 Trieste](https://www.melges24.com/news/2023-melges-24-european-sailing-series-michele-paoletti-wins-melges-24-regatta-home-trieste)
  - **ITA 598, 2004 Devoti, Lake Maggiore.** Equipment: Mercury 2.5 hp, Balbi trailer. Snippet only, price not captured. Gone.
  - **Snippet-only price references, all gone:**
    - Bari €16,000 (carbon mast, racing sails, electric outboard)
    - Chioggia (VE) €21,000 (snippet date "26 feb")
    - Pieve di Soligo (TV) €29,500
    - Trieste €16,000 (snippet date "18 giu")
    - **Faenza (RA) €13,500**, a new snippet lead found this round. Source: [WebSearch snippet of Subito "melges 24" pages](https://www.subito.it/annunci-italia/vendita/usato/?q=melges+24)
- Search engines report Subito snapshot ages of "roughly one to one and a half years", so search snippets of Subito search pages are stale caches. This explains why they showed about 15 ads when the live page shows 5. — [WebSearch result for site:subito.it "melges 24"](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24)
- Attempts to recover the old individual ad URLs failed:
  - several targeted searches by sail number and town returned only unrelated Subito ads
  - the Wayback Machine CDX API was unreachable from this environment
  - DuckDuckGo returned a challenge page and Bing returned unusable results

### Inferences
- The "post-Trieste-Worlds wave" of 2025 Subito ads (ITA 528, ITA 501, hull 764's first ad, probably ITA 454) has largely cleared. Of the 2025-era ads, only hull 764 is still for sale, relisted in Ancona in March 2026. The others probably sold or were withdrawn during the 2026 season. The removals alone do not tell which.
- The live Italian stock on Subito is therefore 5 boats, not about 15. The report writer should present the old €16k–29.5k ads (Monfalcone, Padova, Trieste ITA 454, Bari, Chioggia, Pieve di Soligo, Faenza, Trieste €16k) as **price references, not available boats**.
- All five live ads are 8 to 9 months old. Private sellers who have not cut their prices since spring 2026 may be open to negotiation. IT-S2 already says "slightly negotiable".

### Gaps
- For the removed ads I could not find individual URLs, exact posting or removal dates, or whether the boats sold. Some may have moved to the class site, brokers or Facebook, which other researchers cover.
- Whether ITA 454, ITA 528 or ITA 501 are now offered elsewhere was not checked: that belongs to the sailing-specific researcher's scope.

## Q3. Are there Melges 24 ads on other Italian general classifieds?

### Takeaway
I found **no Melges 24 boat ads** on any other Italian general classifieds site. Several of the sites no longer exist: Kijiji.it closed on 31 May 2022 (annunci.it redirects to the closure notice), and the clasf.it domain has lapsed. The rest blocked access or require a login: Bakeca, Wallapop and eBay.it returned 403, and Facebook Marketplace requires login. Trovit, Mitula and Porta Portese could not be reached from this environment. Subito is effectively the only Italian general classifieds site with Melges 24 boats.

### Cited Findings
- **Kijiji.it / eBay Annunci:** gone. kijiji.it and annunci.it both show "Come annunciato, a partire dal 31 Maggio 2022 Kijiji.it ha cessato di esistere" (as announced, Kijiji.it closed on 31 May 2022) and send users to the Subito app. — [kijiji.it](https://www.kijiji.it/); [annunci.it](https://www.annunci.it/?q=melges)
- **clasf.it:** the domain now shows a DropCatch "Auction ended" domain-auction page, so the site is defunct. — [clasf.it](https://www.clasf.it/q/melges-24/)
- **Bakeca.it:** HTTP 403 in headless Chromium (and earlier with curl). Search engines returned no Bakeca Melges 24 result. Not checked. — [Bakeca search](https://www.bakeca.it/annunci/tutte-le-categorie/?keyword=melges+24)
- **Wallapop Italy:** HTTP 403 (CloudFront "request could not be satisfied"). Web search surfaced only unrelated Wallapop pages. Not checked. — [it.wallapop.com search](https://it.wallapop.com/search?keywords=melges%2024)
- **eBay.it:** HTTP 403 error page. Not checked. — [eBay.it search](https://www.ebay.it/sch/i.html?_nkw=melges+24)
- **Facebook Marketplace:** login wall, so public search is not possible. — [Facebook Marketplace search](https://www.facebook.com/marketplace/milan/search?query=melges%2024)
- **Secondamano.it:** the guessed search URL returned "Pagina non trovata" (page not found), and I could not find a public search endpoint. Not checked. — [secondamano.it](https://www.secondamano.it/annunci/?q=melges)
- **Trovit, Mitula and Porta Portese:** the connection failed (proxy tunnel error) for all three, so they were not checked. — [Trovit barche](https://barche.trovit.it/index.php/cod.search_boats/what_d.melges%2024); [Mitula barche](https://barche.mitula.it/barche/melges-24); [Porta Portese Nautica](https://www.portaportese.it/rubriche/Nautica/?q=melges)
- **annuncibarche.it:** HTTP 502. — [annuncibarche.it](https://www.annuncibarche.it/?s=melges)
- **Market-data context:** web searches for "vendo melges 24" and "melges 24 vendesi" returned no Italian general-classifieds ads, only international portals and aggregator market data. Listingsport, for example, tracked 12 Melges 24 listings worldwide in the past 12 months, none led by Italy. — [listingsport Melges 24 for sale](https://www.listingsport.com/it/sailboats/melges/24/for-sale)
- **Earlier round (from the earlier notes, not rechecked):** annunci.it, mondobarcamarket.it, saily.it and barcheamotore.com showed no Melges 24.

### Inferences
- Since Kijiji/eBay Annunci were folded into Subito in 2022, Subito is the de facto single general classifieds site for Italian private boat sales. The five live Subito ads are probably close to the full set of Italian Melges 24s on general classifieds. The exception is Facebook Marketplace and Facebook groups, which cannot be checked automatically.
- Aggregators such as Trovit and Mitula mostly re-index Subito and portal ads, so they would be unlikely to add independent Melges 24 boats even if they were reachable. This is an inference, not verified.

### Gaps
- I could not search Bakeca, Wallapop, eBay.it, Facebook Marketplace, Trovit, Mitula, Porta Portese or Secondamano directly (blocked, login-only or unreachable). An occasional private ad on Facebook Marketplace in particular cannot be ruled out.
