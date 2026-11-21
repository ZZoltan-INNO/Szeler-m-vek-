# Italian Melges 24s for sale through Italian sailing sources: the class, brokers, yards, sail lofts and the racing fleet (checked 2026-11-21)

Scope: the Italian class site (melges24.it), Italian brokers, yards, dealers and sail lofts, club notice boards, the US class classifieds (for ITA 693), and regatta entry lists and results used to identify boats by sail number. Subito.it and Italian general classifieds, Croatia, and the pan-European portals belong to other researchers. Where their leads came up, they are marked "overlap / unverified".

Privacy: private sellers' phone numbers and email addresses are left out on purpose. Each entry only says "contact details on listing".

**Bottom line:** Italian *sailing-specific* sources hold **only two confirmed, currently listed Italian Melges 24s**:
- **ITA 265:** Italian class "Annunci" (classifieds) page, posted 2026-08-28; no price or details.
- **ITA 693 "Melgina":** US class classifieds; €40,000 plus sails, which are priced separately; posted 2026-04-21 and still listed on 2026-11-21.

No Italian broker, yard, sail loft or club board was found listing a Melges 24. Regatta records do let several boats seen in Subito search snippets (ITA 454, 501, 528, 636, 821) be matched to names, owners and clubs. That matching shows the for-sale stock is concentrated in the **Trieste / Monfalcone** fleet.

---

## Q1. What is on the Italian class site's ads page (boats and equipment), via the WordPress REST API, category pages and recent posts?

### Takeaway
The class site has 21 published posts in total. Its "Annunci" category holds 5 ads, and only one of them is a boat (ITA 265, posted 2026-08-28). The other four are used sails, parts and a crew offer, all posted in April 2026. A members-only "Search / Offer Crew & Boats" marketplace also exists, but it needs registration and its single post shows no public content. No post after 2026-08-28 mentions a boat for sale.

### Cited Findings
- The WordPress REST API reports **21 posts in total** (`x-wp-total: 21`). The categories are Annunci (id 16) with 5 posts, Eventi 4, Eventi 2026 3, eventi2024 2, News 0, Uncategorized 6, and a hidden "Members" category (id 17) with 1 post. — [melges24.it WP API posts](https://melges24.it/wp-json/wp/v2/posts?per_page=100&_fields=id,date,modified,link,title,categories); [categories](https://melges24.it/wp-json/wp/v2/categories?per_page=100); [category 17 "Members"](https://melges24.it/wp-json/wp/v2/categories/17)
- **The full contents of the Annunci category** (via [WP API, categories=16](https://melges24.it/wp-json/wp/v2/posts?categories=16&per_page=100)):

  1. **"Vendesi ita265 pronta per regatare"** ("ITA 265 for sale, ready to race"):
     - Post 1612, published 2026-08-28 17:01, modified 2026-08-28.
     - The body is only a mobile phone number: no price, year, builder, location, equipment or photos.
     - It is the only *boat* ad on the class site. — [listing](https://melges24.it/vendesi-ita265-pronta-per-regatare/)
  2. **"Tactical available"** (post 1590, 2026-04-22): a crew offer from a tactician, helmsman or main trimmer for the Trieste, Porto Cervo and Europeans regattas. Not a boat. — [post](https://melges24.it/tactical-available/)
  3. **"vendita materiale vario"** ("miscellaneous gear for sale", post 1585, 2026-04-21): an M24 parts list.
     - Items: boomerang, forestay and gennaker halyard sheaves, vang gooseneck, mast sliders, a tiller with logo, jib halyard, bowsprit rubbers, deck pad, 2 Velocitek units, a Vakaros with speedometer.
     - Contacts are a private seller and **Nicholas Dal Ferro** (the Dal Ferro yard); contact details on listing. — [post](https://melges24.it/vendita-materiale-vario/)
  4. **"Vele usate 865 in vendita"** ("used sails from 865 for sale", post 1583, 2026-04-21): an itemised North sail inventory "from 865".
     - Mainsails: two from 08/24.
     - Jibs: Ji4+ from 04/23, used for one regatta (the Pre-Worlds); Ji5 brand new 01/23; Ji5 01/24 used at Bacardi 1 and 2; several JI-7 from 03–04/24.
     - Gennakers: P1 2023 used for one regatta (the Worlds); P3 2022; P1s from 01/24, 02/24, 03/24 and 05/24.
     - Carbon batten sets are also available.
     - The sails can be seen at **Cantiere Dal Ferro, Garda**. — [post](https://melges24.it/vele-usate-865-in-vendita/)
  5. **"Vele North usate"** ("used North sails", post 1587, 2026-04-21): a 2025 North main and jib, used only at the Trieste Worlds; contact details on listing. — [post](https://melges24.it/vele-north-usate/)
- The **"Search / Offer Crew & Boats"** page (created 2026-04-10, modified 2026-04-15) says the space "is designed to be used as a Marketplace or for those seeking a crew position or looking for new team members. For more details, please contact the class secretary." It pulls posts from the members-only category 17 and asks visitors to register. — [page](https://melges24.it/search-offer-crew-boats/)
  - The only post linked to it, "Restricted content" (post 1569, 2026-04-10), has empty public content. — [WP API post 1569](https://melges24.it/wp-json/wp/v2/posts/1569)
- **Posts after 2026-08-28:** only "Avviso Convocazione Assemblea Ordinaria Elettiva" (notice of the ordinary electoral general meeting, 2026-11-02) and regatta notices. None mention a boat for sale. — [WP API posts list](https://melges24.it/wp-json/wp/v2/posts?per_page=100&_fields=id,date,modified,link,title,categories)
- A site-wide WP search for "vend" returns only the three April sale posts, the ITA 265 ad and the privacy page. — [WP search](https://melges24.it/wp-json/wp/v2/search?search=vend&per_page=50)
- The media library has the **2026 Coppa Tito Nordio entry list** (uploaded 2026-05-20) and the **2025 Italian circuit ranking** (2025-08-24), both used in Q4. — [WP API media](https://melges24.it/wp-json/wp/v2/media?per_page=30)

### Inferences
- The class site is a weak sales channel: one boat ad in 2026, and that ad has no specifications. Most of the other classified traffic is sails and parts, routed through the Dal Ferro yard on Lake Garda.
- The Dal Ferro yard appears as a contact on two of the five ads and refitted ITA 693 (see Q3). That makes it the practical hub for buying and selling M24 gear in Italy.
- The "865" sail inventory has been used at the Bacardi Cup and the Worlds. It probably belongs to a top-level team (USA 865 "Wah Gwan" led the 2026 Worlds per [Pressmare](https://pressmare.it/en/regattas/melges-24/2026-09-26/2026-late-breeze-big-rewards-day-4-harbor-springs-92986)). This is unconfirmed: the ad does not name the boat's nationality.

### Gaps
- The members-only marketplace (category 17) cannot be read without registering.
- ITA 265 has no price, year, builder, location or equipment listed. It is not in any 2022–2026 Italian regatta result I checked (see Q4).
  - A search-engine summary claimed a Subito ad for "ITA 265" with extra training sails and a lifting keel. That claim is unverified and belongs to the Subito researcher.

---

## Q2. Which Italian brokers, yards, dealers, sail lofts and clubs list Melges 24s?

### Takeaway
None of the Italian brokers, yards, sail lofts or clubs that could be reached lists a Melges 24 for sale as of 2026-11-21. Mondialbroker returns zero results, and saily.it has no classifieds. Several broker domains could not be reached from this research environment. Cantiere Dal Ferro (Lake Garda) is the de facto M24 service and gear hub, but it has no boat listing online.

### Cited Findings
- **Mondialbroker:** its Melges 24 model page returns "Nessuna imbarcazione corrisponde ai criteri di ricerca inseriti" ("no boats match the search criteria entered"; checked 2026-11-21). — [mondialbroker.com Melges 24](https://www.mondialbroker.com/Melges_24.aspx?reqtype=modello)
- **Saily.it:** /it/barche-usate/melges resolves to a 2023 editorial article about the Melges 15. It is not a classifieds listing, and no Melges 24 boat ad was found. — [saily.it](https://www.saily.it/it/barche-usate/melges)
- **Nautica Report:** /annunci/ returns HTTP 404. A site-restricted search found only regatta news. — [nauticareport.it/annunci](https://www.nauticareport.it/annunci/)
- **mondobarcamarket.it:** the homepage loads (HTTP 200) but has no Melges mention. The earlier round found its search URL returns 404. — [mondobarcamarket.it](https://www.mondobarcamarket.it/)
- **Could not be checked from this environment**, because the proxy returned "CONNECT tunnel failed, 502", there was a TLS mismatch, or WebFetch got a 503:
  - barcheusate.it (TLS certificate mismatch; WebFetch 503)
  - paginenautiche.it
  - velaeoltre.it
  - nautivela.it
  - seaboats.net
  - yachtbrokeritalia.it
  - mondobarca.it
  - the guessed domains cantieredalferro.it and dalferro.it (the yard's real web address was not confirmed)

  A domain-restricted web search across nautivela.it, barcheusate.it, mondobarca.it, paginenautiche.it, nauticareport.it, velaeoltre.it, yachtbrokeritalia.it, seaboats.net, fragliavela.org, fragliavelariva.it and yacht4web.com returned **no Melges 24 sale listings**, only Pressmare regatta news. — [Pressmare example](https://pressmare.it/en/regattas/melges-24/2026-10-14/melges-24-european-sailing-series-2026-razjaren-wins-overall-93493)
- **Cantiere Dal Ferro (Garda):**
  - Refitted ITA 693 in 2020 (new carbon rudder, rudder fitting, reinforcements, floor, Southern Spars mast). — [usmelges24.com/for-sale](https://usmelges24.com/for-sale)
  - Stores the used "865" sails for viewing. — [melges24.it](https://melges24.it/vele-usate-865-in-vendita/)
  - Nicholas Dal Ferro is a contact on the class parts ad. — [melges24.it](https://melges24.it/vendita-materiale-vario/)
  - A search for "Melges 24" "Dal Ferro" vendita returned no boat-for-sale page (only Melges 32 brokerage hits).
- **Sail lofts:** Quantum Italia's Melges 24 page is sail products only. Searches found no North Sails Italia, OneSails or Quantum brokerage listing for an M24 boat. — [quantumsails.com/it Melges 24](https://www.quantumsails.com/it/sails/one-design/inshore/melges-24)
- **Clubs:**
  - Fraglia Vela Riva's 2026 Melges 24 regatta page returns 404. — [fragliavelariva.it](https://www.fragliavelariva.it/regate/melges-24-2026/)
  - Yacht Club Sanremo's Melges 24 page only holds 2013–2015 documents. — [yachtclubsanremo.it](https://www.yachtclubsanremo.it/regata/melges-24-2/)
  - No online notice-board ads were found for Fraglia Vela Malcesine, Torbole, Circolo Vela Gargnano, Società Triestina della Vela or YC Adriaco.
- **Yacht4web:** a 1999 Melges 24 listed by the broker B&B Yacht Broker Charter is, per a search snippet, an archived 2016 listing marked sold. The page now returns 404, so it is not a current listing. — [it.yacht4web.com 58441](http://it.yacht4web.com/Melges-performance-sailboats/24/58441)
- **Portal pages with an Italian interface but non-Italian boats:**
  - Search snippets for yachtworld.it show a 1997 M24 at €29,456 and a 2009 at €42,730. Per those snippets, both are US-located (a Florida broker; Milwaukee). Direct fetch returned 403. — [yachtworld.it Melges 24](https://www.yachtworld.it/barche-in-vendita/marca-melges/modello-24/)
  - youboat.com/it returned 403 to both curl and WebFetch. — [youboat Melges 24](https://www.youboat.com/it/l-smg/tutte-barche/melges/melges-24)
- **acquadimare.net** (a La Spezia sailing site with a "Compro & Vendo" (buy & sell) section) has an "AAAAA VENDESI MELGES 24" ad for **ITA 122**:
  - USA-built, with road trailer, 3 North sail sets, refinished deck.
  - "Prezzo trattabile" ("price negotiable"), no figure given.
  - Marked **"VENDUTO!"** (sold).
  - The WP API dates it **2016-06-16 (modified 2017-11-28)**. A search-engine summary had wrongly called it a "June 20, 2026" ad. Historical only. — [acquadimare.net post](https://www.acquadimare.net/aaaaa-vendesi-melges-24/); [WP API post 7224](https://www.acquadimare.net/wp-json/wp/v2/posts/7224)

### Inferences
- Italian brokers barely handle Melges 24s. At €12–45k, these are small, cheap one-design boats that sell privately: through Subito, the class network, Facebook and WhatsApp, and word of mouth at yards such as Dal Ferro (Garda) and the Adriaco yard in Monfalcone, where ITA 528 can be viewed per the Subito snippets in the earlier notes.
- The unreachable broker sites can't be ruled out entirely. Still, the domain-restricted search returned nothing, so they probably hold no M24 stock.

### Gaps
- I could not read barcheusate.it, paginenautiche.it, velaeoltre.it, nautivela.it, seaboats.net or yachtbrokeritalia.it directly (network or TLS failures). They should be checked manually.
- I didn't confirm Cantiere Dal Ferro's own website URL. Whether the yard holds boats for brokerage would need a phone or email enquiry.
- Devoti Sailing (the Czech builder of many Italian hulls) has no Italian dealer page with used boats that I could find.

---

## Q3. Re-verify ITA 693 (€40,000 plus sails, US class classifieds, contact via OBR): is it still listed, is it advertised in Italy, and what are its year and race history?

### Takeaway
**ITA 693 "Melgina" is still listed** on the US class classifieds as of 2026-11-21: "Posted Apr 21, 2026", €40,000 plus sails on demand, location "Italy". It is the only European boat on that page. It is **not** advertised on the Italian class site, and I found it on no Italian broker. Its owner, Paolo Brescia (Yacht Club Italiano), has raced a different boat, **ITA 854** (ex-"Maidollis"), as "Melgina" since 2024. ITA 693 does not appear in any 2026 Italian regatta result, so it is a surplus top-level boat. Its build year is not stated; I infer about 2006–07 from hull-number neighbours.

### Cited Findings
- **Current listing**, re-fetched 2026-11-21:
  - The page has 12 boats, and ITA 693 is the only one in Italy or Europe.
  - It reads "€40.000 Euro + Sails on Demand", with each sail priced separately at about €1,000–2,800. Location: "Italy" only, with no city or marina.
  - "Built by Melges Performance Sailboats US"; no build year or hull number.
  - "Fully renovated by Dal Ferro in 2020" (new Southern Spars mast and carbon rudder in 2020); a 2023 Honda 2.3 outboard is included.
  - "Posted: Tuesday, April 21, 2026."
  - Contact: "Paulo Brescia", by email at an OBR company domain (contact details on listing). A second, hidden mailto address is in the page source.
  - No "sold" marker. — [usmelges24.com/for-sale](https://usmelges24.com/for-sale)
  - Full equipment and sail price list (Gottifredi-Maffioli running rigging, Balbi trailer with box, ten North 3Di/AirX sails 2020–2023 totalling €18,500): see the earlier notes, which cite the same page. — [usmelges24.com/for-sale](https://usmelges24.com/for-sale)
- **Not on Italian class or broker channels:** the melges24.it Annunci category has no ITA 693 post. — [WP API categories=16](https://melges24.it/wp-json/wp/v2/posts?categories=16&per_page=100). Mondialbroker has zero M24s. — [mondialbroker](https://www.mondialbroker.com/Melges_24.aspx?reqtype=modello)
- **Race history of ITA 693 "Melgina"** (IM24CA profile and Italy pages):
  - **2020 Italian Champion** (Torbole), crew Simon Sivitz Kosuta, Jas Farneti, Stefano Orlandi and Ariberto Strobino.
  - **1st overall, 2022 European Sailing Series**.
  - **3rd overall, 2022 European Championship** (Genoa).
  - 2021 ITA Melges 24 Tour Act 1 at Talamone, photographed as "Melgina IT693".

  — [melges24.com/paolo-brescia](https://www.melges24.com/paolo-brescia); [melges24.com/italy](https://www.melges24.com/italy)
  - A search result title also places "Paolo Brescia on his Melgina ITA693" at the **2019 Worlds, Villasimius**. — [melges24.com/paolo-brescia](https://www.melges24.com/paolo-brescia)
- **Conflict on the 2021 ESS win:** the IM24CA profile lists the "2021 – I Overall" ESS title as "Melgina **ITA793**", and 2021 Trieste photo captions say "Melgina ITA793". Yet another 2021 caption on the same page says "Melgina ITA693", and the US listing claims the 2021 ESS win for ITA 693. ITA 793 is separately recorded as "General Lee" (Mario Ziliani, 2018 champion) and now "Gilles" (class president Marcello Caldonazzo Arvedi). "ITA793" for Melgina is therefore either a typo or a one-off boat swap. — [melges24.com/paolo-brescia](https://www.melges24.com/paolo-brescia); [melges24.com/italy](https://www.melges24.com/italy)
- **Brescia's replacement boat, ITA 854:**
  - Italian Champion **2024 and 2025 as Melgina ITA854**.
  - ITA 854 was previously **"Maidollis" of Carlo Fracassoli** (Italian champion 2017 and 2019). — [melges24.com/italy](https://www.melges24.com/italy)
  - 2025 Worlds entry: **ITA 854 MELGINA**, Yacht Club Italiano. — [2025 Worlds entry list (Sailti)](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261)
  - 2026: Coppa Tito Nordio entry No. 1 "Melgina ITA 854, Brescia Paolo, Yacht club italiano". — [melges24.it entry list PDF](https://melges24.it/wp-content/uploads/2026/05/entry-lkist-v5.pdf)
  - Results: 2nd at Trieste (May 2026) — [results PDF](https://www.melges24.com/document/4628). 7th and Corinthian winner at Riva (July 2026) — [results PDF](https://www.melges24.com/document/4750). 2nd overall at the 2026 Europeans. — [melges24.com/paolo-brescia](https://www.melges24.com/paolo-brescia)
- **Data conflict:** the class's own "Melges 24 Italian Circuit 2025 – Trofeo Gaudi" ranking PDF lists the rank-1 boat as "ITA **693** MELGINA – Paolo Brescia". But the official Riva 2025 results show Melgina as **854**, as do the 2025 Worlds entries. The ranking sheet apparently reused the old sail number. — [ranking-ita-2025.pdf](https://melges24.it/wp-content/uploads/2025/08/ranking-ita-2025.pdf); [Riva 2025 results](https://www.melges24.com/document/4136)
- **ITA 693 has not raced in 2026 Italian events:** it is absent from the Trieste ESS 2 entry list and results (19 entries / 18 classified, May 2026) and the Riva ESS 7 Italian Championship results (30 boats, July 2026). — [entry list](https://melges24.it/wp-content/uploads/2026/05/entry-lkist-v5.pdf); [Trieste results](https://www.melges24.com/document/4628); [Riva results](https://www.melges24.com/document/4750)

### Inferences
- **Build year, inferred:** the Subito snippets in the earlier notes give hull 598 = 2004 (Devoti), 636 = 2005 (Melges USA), 764 = 2008 (Devoti) and 821 = 2011 (Devoti). Melges 24 sail numbers follow hull numbers, so **hull 693 was probably built in about 2006–2007** by Melges in the US. It is not the 2003–2004 suggested in the brief. Confirm with the seller or the hull ID number.
- Brescia has raced ITA 854 since 2024, so ITA 693 has probably been for sale on and off since 2024–25. That fits the earlier search snippet calling the US listing page about 556 days old (around May 2025). The "Posted Apr 21, 2026" date is likely a re-post. The boat still being listed after seven months, at a premium price, suggests the market is slow at €40k-plus for a 20-year-old hull, even a championship-winning one.
- **Location:** the 2020 refit was at Dal Ferro (Garda), and Brescia's club is Yacht Club Italiano (Genoa). The boat is therefore most likely stored on Lake Garda or near Genoa. Not confirmed.

### Gaps
- Exact build year, hull ID, VAT status and storage location are not on the listing.
- I found no Italian-language advert for ITA 693; the Subito and Facebook checks belong to other researchers or need a login.

---

## Q4. Regatta entry lists and results: cross-checking the sail numbers of boats known to be for sale (ITA 265, 454, 501, 528, 598, 636, 693, 821, hull 764)

### Takeaway
Regatta records identify five of the boats seen in Subito snippets: ITA 454 "Skorpios", ITA 501 "Forever G", ITA 528 "Ora d'Aria", ITA 636 "Marrakech Express"/"Foxydry" and ITA 821 "Raffica". All of them belong to the Trieste / Monfalcone fleet. ITA 821 was still raced by its owner in 2026, so a Subito ad for it is either old or a "sale while racing" ad. ITA 265, ITA 598 and hull 764 don't appear in any 2022–2026 Italian result I checked.

### Cited Findings
**Fleet context:**
- 2025 Worlds (Trieste): **25 Italian boats** in the entry list. Examples include ITA 139, 229, 392, 455, 528, 538, 563, 579, 590, 633, 636, 638, 639, 689, 722, 730, 731, 742, 748, 778, 791, 817, 821, 840 and 854. — [2025 Worlds entry list](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261)
- 2026 Coppa Tito Nordio (Trieste, 22–24 May 2026): 19 entries, 12 of them Italian. — [entry list PDF](https://melges24.it/wp-content/uploads/2026/05/entry-lkist-v5.pdf)
- 2026 Italian Championship (Riva, July 2026): 30 boats classified. — [results PDF](https://www.melges24.com/document/4750)
- The 2026 IM24CA Italian member list names about 25 members across about 15 boats. — [melges24.com/italy](https://www.melges24.com/italy)

**Per sail number:**
- **ITA 454 "SKORPIOS":** owner Alberto Venuti, helm Tito Rodda, Y.C. Adriaco (Trieste).
  - 2022 ITA Tour Act 4 / ESS Act 5, Porto Maurizio (Imperia): 11th, Corinthian. — [results PDF](https://www.melges24.com/document/2859)
  - 2023 ESS, Trieste: 9th overall. — [2023 Trieste results](https://www.melges24.com/sites/default/files/2023-09/EU-M24_classifica%20dopo%208%20prove.pdf)
  - Not in any 2025 or 2026 Italian result I checked.
  - In 2025, Tito Rodda helmed ITA 730 "Vertigo" instead. — [ranking-ita-2025.pdf](https://melges24.it/wp-content/uploads/2025/08/ranking-ita-2025.pdf)
  - Overlap: a Subito snippet shows ITA 454 in Trieste at €25,000, dated "10 mar". — [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24) (unverified)
- **ITA 501 "FOREVER G":** club SVOC (Società Velica Oscar Cosulich, Monfalcone).
  - 2022 ITA Tour Act 4, Porto Maurizio: 14th. — [results PDF](https://www.melges24.com/document/2859)
  - A search snippet links it to Andrea Totis (Corinthian, 2023 Malcesine Tour). Not verified: the Malcesine results load through JavaScript.
  - Not in any 2025 or 2026 result.
  - Overlap: Subito snippet "Padova, ITA 501, €22,000" (unverified).
- **ITA 528 "ORA D'ARIA":** Daniele Pegoraro; Worlds crew includes Arrigo Zorzut; club Diporto Nautico Sistiana.
  - **ESS 7 Monfalcone (July 2025): 18th**, Corinthian. — [Monfalcone 2025 results](https://www.melges24.com/document/4202)
  - **2025 Worlds entry.** — [Worlds entry list](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261)
  - 2025 Italian ranking: 30th of 31. — [ranking-ita-2025.pdf](https://melges24.it/wp-content/uploads/2025/08/ranking-ita-2025.pdf)
  - It sailed as "Zero24" (Rochelli, SVOC, Corinthian, 13th) in an earlier ESS Act 4 Trieste results sheet; the year isn't shown in the extract. — [results PDF](https://www.melges24.com/document/1454)
  - **Not in the 2026 Trieste or Riva results.**
  - Overlap: Subito snippet "ITA 528, Monfalcone, €21,000; Southern Spars carbon mast, 3 sail sets, Honda 2.3, trailer; viewable at the Adriaco yard" (unverified).
- **ITA 636 "MARRAKECH EXPRESS":** Davide Rapotez, S.T. Sport del Mare (Trieste).
  - 2023 ESS, Trieste: 10th. — [2023 Trieste results](https://www.melges24.com/sites/default/files/2023-09/EU-M24_classifica%20dopo%208%20prove.pdf)
  - At the **2025 Worlds it was entered as "FOXYDRY"**, crew Leonardo Centuori and others, S.N. Pietas Julia. — [Worlds entry list](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261)
  - A public Facebook page "Melges24 Ita636 Marrakech Express- Lynx" exists; no posts were readable. — [facebook.com/Melges24ITA636](https://www.facebook.com/Melges24ITA636/)
  - Per a search snippet, under Angelo Di Terlizzi Marrakech Express ITA 636 won a 2015 ESS event. — [melges24.com/angelo-di-terlizzi](https://www.melges24.com/angelo-di-terlizzi) (not opened)
  - Overlap: Subito "2005, built in the USA by Melges Performance, Trieste, with trailer, motor, sails". A search summary says the seller is named "Davide" and the ad is dated 4 March 2026 (unverified).
- **ITA 821 "RAFFICA":** Davide Rapotez, S.T. Sport del Mare.
  - ESS 7 Monfalcone 2025: 14th. — [results](https://www.melges24.com/document/4202)
  - 2025 Worlds entry. — [entry list](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261)
  - **2026 Trieste: 11th.** — [results](https://www.melges24.com/document/4628)
  - **2026 Riva: 23rd.** — [results](https://www.melges24.com/document/4750)
  - Listed as Rapotez's boat in the 2026 IM24CA member list. — [melges24.com/italy](https://www.melges24.com/italy)
  - The 2025 class ranking mislabels it "AUT 821". — [ranking-ita-2025.pdf](https://melges24.it/wp-content/uploads/2025/08/ranking-ita-2025.pdf)
  - Overlap: Subito snippet "ITA 821, 2011, Devoti Performance (CZ), Trieste" (unverified).
- **ITA 693 "MELGINA":** see Q3. Not raced in 2026; the owner moved to ITA 854.
- **ITA 265, ITA 598, hull 764:** not found in any results or entry list I checked:
  - 2022 Porto Maurizio and Genoa Europeans
  - 2023 Trieste
  - 2025 Riva, Monfalcone and Worlds entries
  - 2026 Trieste and Riva

  A search hit suggesting ITA 265 at the 2025 Riva championship was spurious: "265" does not occur on that event page. — [ESS 3 2025 Riva page](https://melges24.com/ess-3-2025-ita-melges-24-national-championship-riva-del-garda-ita)
  - Overlap: a search snippet says ITA 598 (2004 Devoti, Lake Maggiore) is "pronto per regate" ("ready to race") at **€20,000**. Unverified; a new price detail versus the earlier notes.

### Inferences
- Rapotez appears to have moved from ITA 636 (2023) to ITA 821 (2025–26), and ITA 636 raced in 2025 under a different crew and name. A Subito ad for ITA 636 by a seller called "Davide" fits Rapotez selling his old boat. A Subito ad for ITA 821 while he still races it in 2026 is odd: it may be an older ad, or he may be selling the newer boat. This is speculative and needs a check on the Subito ad itself.
- ITA 454 and ITA 528 stopped racing after 2023 and 2025 respectively, which fits them being on the market.
- The for-sale fleet is concentrated in Trieste and Monfalcone (YC Adriaco, STSM, SVOC, DN Sistiana). Italy's biggest M24 racing hub hosted the 2025 Worlds, and many owners upgraded around that event.

### Gaps
- Results for the 2023 Malcesine, 2023 Rimini and 2024 Trieste/Riva events are behind JavaScript or expired links (Sailti, RRS). I couldn't search them for ITA 265, 501, 598 or 764.
- Results for Trofeo Gaudi Act 3 (Sanremo, 16–18 Oct 2026) were not found online. — [NOR PDF](https://melges24.it/wp-content/uploads/2026/09/NOR-MELGES-24-TROFEO-GAUDI-ACT-3-rev-MC-R.pdf)

---

## Q5. Are there public, indexed Facebook posts (Melges 24 Marketplace, Melges 24 Italia / Classe Italiana Melges 24) about Italian boats for sale in 2025–2026?

### Takeaway
No. I found no indexed public Facebook post advertising an Italian Melges 24 in 2025–2026. The IM24CA "Melges 24 Marketplace" is a Facebook group behind a login. The one boat page found (ITA 636) showed only its title.

### Cited Findings
- Searches for facebook "Melges 24" vendo / vendesi / "in vendita" ("selling" / "for sale" / "on sale") 2026 returned no Facebook posts, only Subito, YachtWorld, iNautia, boats.com and acquadimare.net pages. — [search results incl. Subito](https://www.subito.it/annunci-italia/vendita/usato/?q=melges)
- The page "Melges24 Ita636 Marrakech Express- Lynx" is public, but WebFetch got only the page title, with no posts. — [facebook.com/Melges24ITA636](https://www.facebook.com/Melges24ITA636/)
- The IM24CA "Marketplace in Facebook" link (facebook.com/groups/melges24marketplace) is a closed group; the earlier round confirmed it can't be read without logging in. — [melges24.com](https://www.melges24.com)

### Inferences
- In Italy the informal channels (Facebook groups, WhatsApp class chats, word of mouth at regattas) are probably where most M24 deals start. Combined with Subito, that likely accounts for most transactions. None of it is visible to this kind of research.

### Gaps
- Facebook groups and WhatsApp channels are not readable without login. Any boat sold privately there would be missed.

---

## Q6. Consolidated per-boat list and where Italian Melges 24s actually change hands

### Takeaway
Only two Italian M24s are confirmed listed on sailing-specific channels: ITA 265 (class site) and ITA 693 (US class site). All other Italian boats come from Subito or from pan-European portals, as overlaps from other researchers, enriched here with regatta identities. In practice, Italian M24s change hands privately: through Subito, the class and fleet network (Trieste/Monfalcone and Garda), the Dal Ferro yard and Facebook/WhatsApp. Brokers play no role.

### Cited Findings

**A. Confirmed listed on sailing-specific sources (status as of 2026-11-21)**

| Boat | Builder / year | Price / VAT | Location | Equipment / condition | Seller | Source and date | Status |
|---|---|---|---|---|---|---|---|
| **ITA 265** (name unknown) | not stated (hull number suggests about 1994–95; inference) | not stated / not stated | not stated (Italy) | "pronta per regatare" ("ready to race"); no other details | private (phone only; contact details on listing) | [melges24.it](https://melges24.it/vendesi-ita265-pronta-per-regatare/), posted and modified 2026-08-28 | Listed; no sold marker |
| **ITA 693 "Melgina"** (Paolo Brescia, YCI) | Melges Performance Sailboats (USA); year not stated (about 2006–07, inferred) | €40,000 + sails on demand (10 North sails 2020–23, €1,000–2,800 each, €18,500 total) / VAT not stated | "Italy" (probably Garda or Genoa; inference) | Dal Ferro full refit 2020; Southern Spars mast 2020; new carbon rudder; Honda 2.3 2023; Balbi trailer with box; Gottifredi-Maffioli rigging | private owner; contact details on listing | [usmelges24.com/for-sale](https://usmelges24.com/for-sale), "Posted Apr 21, 2026" (possibly first posted about May 2025) | Listed; no sold marker; not raced in 2026 |

**B. Italian boats known only from Subito or pan-European portals (overlap / unverified), with regatta identities from Q4**

| Boat | Regatta identity (this research) | Price / location from other sources | Source |
|---|---|---|---|
| ITA 454 | "Skorpios", Venuti / Rodda, YC Adriaco; last raced 2023 | €25,000, Trieste ("10 mar") | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [2023 results](https://www.melges24.com/sites/default/files/2023-09/EU-M24_classifica%20dopo%208%20prove.pdf) |
| ITA 501 | "Forever G", SVOC Monfalcone; last raced 2022 (in results checked) | €22,000, Padova | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [2022 results](https://www.melges24.com/document/2859) |
| ITA 528 | "Ora d'Aria", Pegoraro, DN Sistiana; raced 2025 incl. Worlds | €21,000, Monfalcone; carbon mast, 3 sail sets, Honda 2.3, trailer | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [Monfalcone 2025](https://www.melges24.com/document/4202) |
| ITA 598 | not found in results | 2004 Devoti, Lake Maggiore; €20,000 (search snippet) | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24) |
| ITA 636 | "Marrakech Express" (Rapotez, 2023), "Foxydry" at the 2025 Worlds | 2005 Melges USA, Trieste; price not captured | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [Worlds 2025 entries](https://2025worlds.melges24.com/en/default/races/inscriptionsajax?id=9526&idsc=2261) |
| ITA 821 | "Raffica", Rapotez, STSM; **still raced 2026** | 2011 Devoti, Trieste; price not captured | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24); [Riva 2026](https://www.melges24.com/document/4750) |
| hull 764 | not found in results | 2008 Devoti; "available after the Trieste Worlds" (2025) | [Subito search](https://www.subito.it/annunci-italia/vendita/nautica/?q=melges+24) |
| no sail number | — | boat24 751393, 1993, Lago Maggiore, €12,500 negotiable, private, posted 16/11/2026 (from earlier notes) | [boat24 751393](https://www.boat24.com/en/sailingboats/melges/melges-24/detail/751393/) |
| no sail number | — | iNautia, 2001, Monfalcone, €24,000, private (snippet, from earlier notes) | [iNautia](https://www.inautia.com/used-boat-4634070141855991019755565010145.html) |

**C. Sold or removed (price references only)**
- ITA 122: acquadimare.net, 2016, "VENDUTO!", USA-built, trailer, 3 North sail sets; no price figure. — [acquadimare.net](https://www.acquadimare.net/aaaaa-vendesi-melges-24/)
- 1999 Melges 24: Yacht4web / B&B Yacht Broker Charter, archived 2016 listing, now 404. — [yacht4web](http://it.yacht4web.com/Melges-performance-sailboats/24/58441)

**Where Italian M24s change hands (evidence):**
- **The class network:**
  - The melges24.it Annunci page: 1 boat ad in 2026, plus sails and parts. — [melges24.it/annunci](https://melges24.it/annunci/)
  - A members-only marketplace the class secretary steers people to. — [search-offer-crew-boats](https://melges24.it/search-offer-crew-boats/)
  - The IM24CA Facebook Marketplace group. — [melges24.com](https://www.melges24.com)
- **The US class classifieds**, used by at least one top Italian owner (ITA 693). — [usmelges24.com/for-sale](https://usmelges24.com/for-sale)
- **Yards:** Cantiere Dal Ferro, Garda, handles refits and is where used sails and parts are viewed and contacted. — [melges24.it](https://melges24.it/vele-usate-865-in-vendita/). The Adriaco yard in Monfalcone is a viewing location in the Subito snippets.
- **Subito.it** (other researcher) holds by far the most Italian M24 ads.
- **Brokers:** none found to stock M24s (Mondialbroker returns zero). — [mondialbroker](https://www.mondialbroker.com/Melges_24.aspx?reqtype=modello)
- **Market-volume reference:** a Listingsport search snippet says 2 Melges 24 listings appeared in the last 90 days and 12 in the last 12 months, with a median ask of $30,909. The earlier round recorded 9 listings and a median of $29,131 from the same site, so these figures vary between fetches. — [listingsport.com/it](https://www.listingsport.com/it/sailboats/melges/24/for-sale)

### Inferences
- **Price bands, rough:**
  - Race-proven, refitted 2000s hulls: about €20–25k in the Trieste fleet (ITA 454, 501, 528).
  - Older or 1990s boats: about €12–16k (Lago Maggiore, Laveno, Pescara, Bari).
  - Championship-winning boats: €40k-plus (ITA 693, before sails).
- The cluster of ads around the 2025 Trieste Worlds suggests owners upgrade around big home events. Some of those 2025 ads may already be sold, so they need a direct check.

### Gaps
- The status of every Subito-sourced boat (sold or active, exact posting date, VAT) is unverified here.
- VAT status is unknown for every Italian boat in this set. None of the class or US listings mention IVA (Italian VAT); boats sold privately in Italy are normally VAT-paid (inference, not confirmed).
