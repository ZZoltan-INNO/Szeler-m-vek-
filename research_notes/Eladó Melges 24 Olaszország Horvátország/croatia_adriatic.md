# Melges 24 for sale in Croatia (plus Slovenia and Montenegro): classifieds, fleet and market, status as of 2026-11-21

Scope and method. I searched the Croatian, Slovenian and Montenegrin classifieds directly on 2026-11-21, using a normally rendered headless Chromium (Playwright with the system Chrome, no user-agent changes) and WebFetch. On every site that returned results I also ran a positive-control search for "jedrilica"/"jadrnica" to confirm the search worked, then searched for "melges"/"melges 24". I also ran Croatian- and Slovenian-language web searches and read the class, club and news pages for the Croatian fleet (cromelges24.hr, melges24.com, North Sails Croatia blog, JK Uskok, sail-world).

Bottom line: **I found no live Melges 24 for-sale ad located in Croatia, Slovenia or Montenegro.** The sites I could search (Index Oglasi, Plavi oglasnik, Bolha, oglasi.me, more.hr) return zero Melges results. Index, Bolha and oglasi.me returned real sailboat ads for the control search; Plavi oglasnik's control was only partial. Njuškalo is behind ShieldSquare bot protection (CAPTCHA). I did not try to get around it, and search engines index no Njuškalo Melges ads. The Croatian fleet (19 registered class boats, 14–20 crews per CRO M24 Cup event in 2026) is active and growing ahead of the **2027 Melges 24 World Championship in Pula (29 May – 5/6 June 2027)**. No 2025–2026 news or club post mentions a Croatian boat for sale.

## Key question 1: Which Melges 24 ads are on the Croatian classifieds (Njuškalo, Index Oglasi, Plavi oglasnik, Bazar, more.hr, etc.)?

### Takeaway
None. Every searchable Croatian classified returned zero Melges 24 ads on 2026-11-21. The positive control worked on Index Oglasi and was partial on Plavi oglasnik. Njuškalo could not be searched because of a CAPTCHA wall, and web-search indexes show no Njuškalo Melges ad. **Per-boat list: empty.** No boat can be listed with URL, sail number, price, location or date, because no such ad was found.

### Cited Findings

**Per-site results (checked 2026-11-21)**

| Site | Query | Result | Positive control | URL |
|---|---|---|---|---|
| Njuškalo (njuskalo.hr) | "melges" | **Blocked.** The page redirects to validate.perfdrive.com with the title "ShieldSquare Captcha" and a "Riješi CAPTCHA-u" page saying the request comes from a "proxy mreže". Not bypassed, per instructions. The WebSearch tool also refuses njuskalo.hr as a domain filter ("not accessible to our user agent") | n/a | https://www.njuskalo.hr/index.php?ctl=search_ads&keywords=melges |
| Index Oglasi (index.hr/oglasi) | "melges" (site AI search) | **"0 oglasa" / "Ovdje nema oglasa!"** | "jedrilica" → category "Jedrilice – 59 oglasa" (e.g. Elan 19 in Pula, Triplast Y999 in Ližnjan/Poreč, Jeanneau SO 490 in Split, MaxFun 25 in Dubrovnik). Ads on the first page are dated 2026-07 to 2026-11 | [index.hr search "melges"](https://www.index.hr/oglasi/pretraga?searchQuery=%257B%2522text%2522%253A%2522melges%2522%252C%2522sortOption%2522%253A7%257D&search_type=ai&search_query=melges); [Jedrilice category](https://www.index.hr/oglasi/nautika/plovila/jedrilice/pretraga?searchQuery=%257B%2522module%2522%253A%2522nautika%2522%252C%2522category%2522%253A%2522plovila%2522%252C%2522categoryLv1Ids%2522%253A%255B%25229c8eb5dd-751b-422b-b743-3098c7abfb35%2522%255D%257D) |
| Plavi oglasnik (oglasnik.hr) | "melges" | **"Nažalost, za pojam koji ste unijeli nema rezultata"** (no results for this term) | Partial. "jedrilica" returns category suggestions (e.g. "Auto Moto i Nautika / Nautika") rather than a no-results message, but I did not open a results list | https://oglasnik.hr/?search=melges |
| more.hr (More magazin, site search) | "melges prodaja" | **"Nema rezultata"** | n/a (site search) | https://more.hr/?s=melges+prodaja |
| Bazar.hr | — | Not reachable from this environment (ERR_TUNNEL_CONNECTION_FAILED) | n/a | https://www.bazar.hr/ |
| morski.hr | "melges" | The search parameter was ignored and only the homepage loaded, so no usable result | n/a | https://www.morski.hr/?s=melges |

- The only Index Oglasi sailboat ads in the right size bracket were non-Melges boats (e.g. "ELAN 19 – opremljena jedrilica s uvlačnom kobilicom", Pula, 5,600 €, 03.11.2026; "Triplast Y999", Ližnjan, 48,000 €). This shows the category is live and holds small sport/day boats, but no Melges — [index.hr Jedrilice](https://www.index.hr/oglasi/nautika/plovila/jedrilice/pretraga?searchQuery=%257B%2522module%2522%253A%2522nautika%2522%252C%2522category%2522%253A%2522plovila%2522%252C%2522categoryLv1Ids%2522%253A%255B%25229c8eb5dd-751b-422b-b743-3098c7abfb35%2522%255D%257D)
- Croatian-language web searches ("Melges 24 prodaja", "\"Melges 24\" prodajem", "njuskalo Melges 24 jedrilica", "Melges 24 CRO prodaja jedrilice regatna sportska 2026") returned no Croatian sale ad. The only Croatian-language market page found is a listingsport.com price-guide page — [listingsport.com/hr](https://www.listingsport.com/hr/sailboats/melges/24)
- listingsport.com/hr ("Melges 24 — informacije, osvrt, specifikacije") says "7" Melges 24 are for sale, with a 12-month median ask of 26,540 € and a 3-month trend of −12.5% (a second table on the page shows a 30,066 € median, which conflicts). Its for-sale list shows **6 listings, none in Croatia, Slovenia, Montenegro or Italy**: USA (Tennessee, Alabama, Florida), Konstanz DE (boat24 670226, now gone), Küssnacht CH (boat24 696671, now gone), and one Apollo Duck ad (2007, ~€44,187) with no location — [listingsport for-sale list](https://www.listingsport.com/hr/sailboats/melges/24/for-sale); [listingsport overview](https://www.listingsport.com/hr/sailboats/melges/24)
- A search summary claimed "3 Melges 24 iz 1993. godine na prodaju" in Croatia, citing listingsport.com/hr. Opening the page showed this is wrong: the listingsport pages are a global aggregate, not Croatian listings — [listingsport.com/hr Melges](https://www.listingsport.com/hr/sailboats/melges)
- The Croatian class site has no marketplace or "prodaja" section (sections: CRO M24 Cup, Novosti, Klasa, Članovi, Media, Kontakt) — [cromelges24.hr](https://cromelges24.hr/). The earlier round also found that a WordPress search for "prodaj" there returned no posts — [cromelges24.hr](https://cromelges24.hr/)

**Sold/removed boats as price references.** None of the 2025–2026 Croatian/Adriatic ads could be found even as removed listings. The nearest price evidence comes from neighbouring markets and other files:
- 2025–26 DACH asking prices for whole boats ran from about EUR 14,800 (2000, Konstanz, EU VAT paid; gone) to EUR 30,000 (2004, Meersburg; 410 Gone). Hungarian Balaton ads ran HUF 3.9–4.5M (old or removed) — see `../Eladó Melges 24 hajók Európában/central_eastern_dach_classifieds.md`; [boat24 670226](https://www.boat24.com/en/sailingboats/melges/melges-24-od/detail/670226/)
- In 2020 the North Sails Croatia loft blog said early Croatian fleet boats were bought at "relativno male cijene jedrilice u dosta dobrom stanju" (relatively low prices for boats in quite good condition), some jointly by several sailors. No figures were given — [North Sails: Formirana Melges 24 CRO flota](https://www.northsails.com/sailing/en/loft-news/formirana-melges-24-cro-flota)

### Inferences
- Melges 24s are not traded on Croatia's general classifieds. Index's search was confirmed working by its control, and Plavi oglasnik and more.hr returned explicit no-results messages, so a Melges ad on those sites would very likely have shown up. Njuškalo is the only big Croatian portal I could not check. A Melges ad there would probably also be indexed by search engines or mentioned by the class, and neither happened, so a live Njuškalo ad is unlikely but not ruled out.
- Croatian boats seem to change hands privately inside the CRO M24 Cup community (club contacts, the class's Facebook/Instagram, the IM24CA "Melges 24 Marketplace" Facebook group). The early fleet was imported from abroad through sailor networks, not public ads (see KQ2).

### Gaps
- **Njuškalo was not checked** (ShieldSquare CAPTCHA). Someone needs to look manually in a normal browser: Nautika > Jedrilice, keyword "melges".
- Bazar.hr was unreachable (tunnel failure), morski.hr's search did not work in automation, and I found no "Nautika oglasi" site to search.
- Facebook (class page facebook.com/cromelges24, "Melges 24 Marketplace" group) needs a login and was not searched. Public Facebook search results showed no Croatian Melges posts.
- Exact HRK/EUR prices of Croatian-fleet transactions are not public.

## Key question 2: What does the Croatian Melges 24 fleet (CRO M24 Cup) look like, which clubs and boats are in it, and do 2025–2026 news or club posts mention boats for sale or imported from Italy?

### Takeaway
The Croatian Melges 24 Class lists **19 member boats** across about 12 clubs, spread over Split, Biograd, Opatija, Kostrena, Kaštela, Trogir, Šibenik, Pula and Samobor. 2026 regattas drew 14–20 crews, including visiting Italian boats (Melgina ITA854, Strambapapa ITA689). Pula hosts the 2027 Worlds. No 2025–2026 news or club post mentions a Croatian boat for sale. The only documented boat movements are boats arriving: Italian and British boats joining the Croatian circuit, and a sailor returning with a boat (Stipanović, "Yikes"). The last documented departure was "Strilica Zuxu" (c. 2022).

### Cited Findings

**Class roster (cromelges24.hr "Članovi", full members; fetched 2026-11-21)**

| Sail no. | Boat | Owner/skipper (as listed) | Club | Base |
|---|---|---|---|---|
| CRO 166 | Otavić | Dalibor Matijašević | JK Galeb | Kostrena (Rijeka) |
| CRO 383 | Skitnica | Mario Škrlj | Marina Kaštela | Kaštela |
| CRO 389 | Obi Wan | Toni Bulaja | JK Mornar | Split |
| CRO 496 | Uskoro | Ivica Miković | Biograd | Biograd |
| CRO 517 | Cezibordo | Srđan Ninčević | JK Opatija | Opatija |
| CRO 554 | One 4 Fun | Karlo Kuret | JK Labud | Split |
| CRO 562 | She | Ana Gojčeta | Šibenik | Šibenik |
| CRO 571 | Panjić JR | Duško Zurić | JK Briva | Biograd |
| CRO 649 | Mataran 24 | Ivo Matić | JK Trogir | Trogir |
| CRO 728 | Little A | Domagoj Jaklin | JK Split | Split |
| CRO 739 | PariPanj | Luka Šangulin | JK Briva | Biograd |
| CRO 742 | Fjonda | Goran Ivanković | JK Opatija | Opatija |
| CRO 759 | Zen | Kolja Dumanić | Špinut | Split |
| CRO 760 | Spooky | Fran Borna Urban | Samobor | Samobor |
| CRO 782 | Cro-a-Sail | Matija Reljanović | JK Opatija | Opatija |
| CRO 792 | Joyrunner | Boris Tomić | JK Uljanik | Pula |
| CRO 803 | Panjić | Luka Šangulin | JK Briva | Biograd |
| CRO 827 | Blue Label | Davor Jelača | YC Croatia | Opatija |
| CRO 867 | Razjaren | Łukasz Podniesiński | JK Split | Split |

Source: [cromelges24.hr/clanovi](https://cromelges24.hr/clanovi/). The page gives no build years or builders. Home ports are inferred from the club name and town shown.

**Class officers:** chairman Luka Šangulin (CRO 739 "Panjić"), secretary Boris Bakotić, press officer Hrvoje Bulešić, class manager Marko Mišura (Split) — [melges24.com/croatia](https://melges24.com/croatia)

**Fleet size over time**
- 2022 season recap: "jedrilica s CRO oznakom na jedrima ima 22", one of the largest fleets in Europe and the world — [North Sails: Rezime druge sezone M24 Kupa](https://www.northsails.com/blogs/north-sails-blog/rezime-druge-sezone-m24-kupa)
- Opatija 2023: "record-breaking" 25 crews; Zadar 2024: 21 crews; 2026 Croatian Open (Biograd): 20 crews from six countries; 2026 Pula opener: 18 teams — [melges24.com/croatia](https://melges24.com/croatia)
- Opatija ESS, April 2025: "čak 24 posade" from Italy, Austria, Hungary, Slovenia, Great Britain, Poland and Croatia — [more.hr, 4 Apr 2025](https://more.hr/blog/melges-24-strambapapa-se-vratila-na-hrvatska-regatna-polja/)
- The class site describes the Eastern Adriatic fleet as the world's third largest, with more than 20 boats (search snippet) — [melges24.com/regatecomhr](https://www.melges24.com/regatecomhr)
- CRO M24 Cup organisers expected about 15 crews per regatta, but most 2025–26 events drew 18–20 (Mišura) — [melges24.com, 4 May 2026](https://www.melges24.com/news/ante-cesic-and-razjaren-crew-defend-melges-24-croatian-title)

**2025–2026 events and entries**
- 2025–26 CRO M24 Cup: Split Act 1 (31.10.–02.11.2025), Trogir Act 2 (14.–16.11.2025), Biograd (27.2.–1.3.2026, no racing), Zadar (13.–15.3.2026), Opatija/ESS (April 2026), Croatian Open in Biograd (1.–3.5.2026). Series division winners include Luka Šangulin/Tomislav Bašić, Ante Botica/Ivo Matić, Ł. Podniesiński/Ante Ćesić, Stipe Ćesić, Kolja Dumanić and Fran Borna Urban — [melges24.com 2025-2026 CRO Cup](https://www.melges24.com/2025-2026-cro-melges-24-cup)
- Zadar (JK Uskok), 14–15 Mar 2026: 19 crews from Italy, Norway and Croatia. 1 Razjaren, 2 Strambapapa (M. Paoletti), 3 Melgina (P. Brescia). Italian "Daito Nano" and Norwegian "Party Girl" also raced. Otavić (hull 166) was described as the oldest boat in the fleet — [jkuskok.hr](https://jkuskok.hr/2026/03/15/cro-melges-24-u-zadarskom-kanalu-trijumf-posade-razjaren/); [sail-world](https://www.sail-world.com/news/294483/CRO-Melges-24-Cup-Zadar)
- Croatian Open, Biograd (JK Briva), 1–3 May 2026: 20 crews. 1 Razjaren CRO 867 (helm Ante Ćesić, JK Split; owner Łukasz Podniesiński), 2 Melgina ITA 854, 3 Strambapapa-MPSailing ITA 689. Corinthian champion Little A CRO 728; U25 winners Cro-a-sail (JK Opatija) and Panjić Jr. (JK Briva) — [melges24.com](https://www.melges24.com/news/ante-cesic-and-razjaren-crew-defend-melges-24-croatian-title)
- Pula, 7th CRO M24 Cup season opener (also the ESS final), Sept 2026: 18 crews registered from Croatia, Italy and Hungary, 16 sailed (Joyrunner and Melgina absent). "Regatnu premijeru u Puli imat će posada Melgesa Skitnica" (Skitnica's young Marina Kaštela crew made its debut). "U klasu Melges vraća se … Tonči Stipanović" with "Yikes" — [cromelges24.hr, 5 Nov 2026](https://cromelges24.hr/2026/11/05/cro-m24-cup-18-posada-na-otvaranju-sedme-sezone-m24-cupa-u-puli/)
- Trogir, Nov 2026 (14 crews, per the post title): 1 Razjaren (JK Split), 2 Panjić (JK Briva, Šangulin), 3 Mataran (JK Trogir); Blue Label (YC Croatia, H. Petrović) Corinthian winner; Joyrunner (JK Uljanik) U25 winner — [cromelges24.hr, 10 Nov 2026](https://cromelges24.hr/2026/11/10/cro-m24-cup-trogir-na-postolju-razjaren-panjic-i-mataran/); [news index](https://cromelges24.hr/novosti/)
- **2027 Worlds:** Melges 24 World Championship in Pula, 29 May – 5 June 2027 (the Trogir post says 29 May – 6 June), "najznačajnija regata na Melgesima otkako se u toj klasi organizirano jedri u Hrvatskoj" (the most important Melges regatta since organised racing began in Croatia) — [melges24.com](https://www.melges24.com/news/ante-cesic-and-razjaren-crew-defend-melges-24-croatian-title); [cromelges24.hr](https://cromelges24.hr/2026/11/05/cro-m24-cup-18-posada-na-otvaranju-sedme-sezone-m24-cupa-u-puli/); [Worlds bid PDF](https://www.melges24.com/sites/default/files/2025-10/CRO_M24%20WORLDS%20PULA%202027%20final.pdf)

**Mentions of boats changing hands, imported, or leaving**
- 2026: "Melgina and Strambapapa … previously sailed with the American fleet in Miami but have now joined the Croatian fleet". A British team sailed "Adrenaline" (ex-"Black Seal") for the first time. **No boats bought, imported or sold are mentioned** — [melges24.com, 4 May 2026](https://www.melges24.com/news/ante-cesic-and-razjaren-crew-defend-melges-24-croatian-title)
- None of the 2026 cromelges24.hr posts reviewed (Apr–Nov 2026) mentions a boat for sale, a new boat or a new owner. The only owner mention is Podniesiński as owner of Razjaren — [cromelges24.hr novosti](https://cromelges24.hr/novosti/)
- 2022 recap: some crews "su već poduzele korake da nabave novije jedrilice" (had already taken steps to get newer boats). Some boats changed ownership "jer su dotadašnji vlasnici htjeli nabaviti neku drugu" (because the previous owners wanted a different boat). "Jedina koja je otišla iz Hrvatske je Strilica Zuxu" (the only boat to leave Croatia was Strilica Zuxu). "Sve jedrilice koje su stigle u Hrvatsku za sad su i ostale u njoj" (every boat that came to Croatia has so far stayed) — [North Sails: Rezime druge sezone](https://www.northsails.com/blogs/north-sails-blog/rezime-druge-sezone-m24-kupa)
- c. 2020: boats were "arriving from abroad" almost weekly, at relatively low prices, some bought jointly. Named arrivals: Blue Label (Kvarner), Lero (Dubrovnik, 2017), Cezibordo (Srđan Ninčević, Labud/Split), The Pimp (Roko Štambuk, Split), Obi One/Obi Wan (Toni Bulaja). The bases were Pula, Ičići, Zadar, Split and Dubrovnik. The source countries were not named — [North Sails: Formirana Melges 24 CRO flota](https://www.northsails.com/sailing/en/loft-news/formirana-melges-24-cro-flota)
- A Novi list search snippet says the oldest active racing Melges 24 in the world, hull "006", is in Kvarner and sailed by the Blue Label crew (YC Croatia). The class roster now shows Blue Label as CRO 827, and Zadar 2026 reports call Otavić (166) the oldest boat in the fleet, so this conflicts (snippet only, article not opened) — [novilist.hr](https://www.novilist.hr/sport/ostali-sportovi/opatija-ce-nakon-dubrovnika-i-biograda-biti-domacin-najjace-hrvatske-jedrilicarske-serije); [cromelges24.hr/clanovi](https://cromelges24.hr/clanovi/); [sail-world Zadar](https://www.sail-world.com/news/294483/CRO-Melges-24-Cup-Zadar)
- Italian boats regularly sail the Croatian circuit. Strambapapa (Michele Paoletti) won the first Split regatta in 2021 and returned in 2025 — [more.hr](https://more.hr/blog/melges-24-strambapapa-se-vratila-na-hrvatska-regatna-polja/)

### Inferences
- **Supply in Croatia is probably tight until mid-2027.** With the Worlds on home water in Pula (May–June 2027), Croatian owners have every reason to keep their boats through the 2026–27 season, and newcomers have reason to buy or charter. Croatian buyers will likely look to Italy, Austria and Hungary for boats, as the fleet did in 2019–2021. After the Worlds (summer 2027), some Croatian boats may come up for sale as crews upgrade. This is speculative.
- The Blue Label 006 vs CRO 827 conflict may mean the YC Croatia crew replaced its very old hull with a newer one (a Croatian upgrade transaction). It could also be an outdated snippet. Unverified.
- Skitnica (CRO 383, Marina Kaštela, new young crew in 2026) and Tonči Stipanović's return with "Yikes" (sail number not given) may be recent ownership changes inside Croatia. The sources do not say so.
- Cross-reference for the Italy researcher: Paolo Brescia's current "Melgina" is **ITA 854** ([melges24.com](https://www.melges24.com/news/ante-cesic-and-razjaren-crew-defend-melges-24-croatian-title)). The ITA 693 advertised by "Paulo Brescia" on the Italian class board (earlier round, [melges24.it Annunci](https://melges24.it/annunci/)) is therefore probably his previous boat, not the current Melgina. This corrects the earlier-round guess that ITA 693 = Melgina.

### Gaps
- The class roster has no build years, builders (Melges USA vs Devoti/Italy) or ex-sail numbers (ex-ITA etc.), so no hull histories could be put together.
- No public record shows where each Croatian boat was bought (Italy, Austria, Hungary, US). A search summary said one Croatian crew bought its boat "thanks to Thomas Beck", but I could not tie that to a specific article, so it is unverified.
- Full Sailwave entry lists for 2026 events were not opened. Only podium and division winners plus named boats are captured.
- JK Labud, JK Mornar and JK Opatija club websites were not checked individually for notice-board sale posts.

## Key question 3: Slovenia and Montenegro (secondary): any Melges 24 for sale?

### Takeaway
None found. Bolha.com returns 0 ads for "melges 24", with a working control of 500 "jadrnica" ads. Oglasi.me (Montenegro) returns "Trenutno nema oglasa" for "melges", with a working "jedrilica" control. Slovenia has a small class (chairman in Maribor) and hosts a yearly ESS event in Portorož, but no sale listings turned up.

### Cited Findings
- bolha.com "melges 24": "0 oglasov", "Trenutno ni oglasov, ki ustrezajo iskalnim kriterijem" (no ads currently match the search) — [bolha.com search](https://www.bolha.com/search/?keywords=melges+24). Control "jadrnica": "500 oglasov" (e.g. Delta 31, Dufour 28, Bavaria 30) — [bolha.com jadrnica](https://www.bolha.com/search/?keywords=jadrnica)
- oglasi.me "melges" (Nautika): "Trenutno nema oglasa" (no ads currently) — [oglasi.me search](https://oglasi.me/pretraga?fullText=melges&sortBy=dateDesc). Control "jedrilica" returned sailboat ads (e.g. "Bavaria - Jedrilica") — [oglasi.me jedrilica](https://oglasi.me/pretraga?fullText=jedrilica&sortBy=dateDesc)
- Slovenian Melges 24 Class Association: chairman Alan Mahne Kalin, Jadralni Klub Skipper Maribor, country measurer Branko Parunov. No fleet size or sale info is given, and the page points only to the general IM24CA marketplace links — [melges24.com/slovenia](https://www.melges24.com/slovenia)
- Portorož (Yacht Club Marina Portorož) has hosted a Melges 24 European Sailing Series event every year since 2014 — [melges24.com 2018 Portorož](https://www.melges24.com/news/2018-melges-24-european-sailing-series-melges-24-fleet-makes-its-fifth-return-portoroz); [sail-world 2024 preview](https://www.sail-world.com/news/274554/Marina-Portoroz-Melges-24-Regatta-preview)
- A Slovenian-language search ("\"Melges 24\" prodam jadrnica") found no Slovenian Melges 24 ad. The only Slovenian boat24 hit was a Melges **15** — [boat24.com/si Melges 15](https://www.boat24.com/si/jadrnice/melges/melges-15/detail/691038/)

### Inferences
- Slovenia's Melges 24 presence is mostly Portorož hosting visiting fleets plus a few local boats. Any Slovenian boat for sale would more likely appear through Italian (Trieste) or Croatian class channels than on Bolha.
- Montenegro has no visible Melges 24 fleet or market.

### Gaps
- The Slovenian class site melges24.ycmp.eu did not connect in the earlier round, and there is no Slovenian fleet roster.
- Porto Montenegro brokerage and Montenegrin sailing clubs were not checked (low priority).

## Key question 4: Do pan-European portals list any Melges 24 located in Croatia or Slovenia?

### Takeaway
No. boat24.com's Melges 24 page shows one used boat for sale, located in Italy (Lago Maggiore), plus two new-boat catalogue entries. Listingsport's aggregated list has no Croatian, Slovenian, Montenegrin or Italian location. Searches combining "Melges 24" and "Croatia" on Yachtall, YachtWorld/boats.com, theyachtmarket and similar sites found only cruisers.

### Cited Findings
- boat24.com Melges 24: "3 listings found": ID 751393 (1993, EUR 12,500, Italy » Lago Maggiore) plus catalogue entries 248090 (2025) and 247043 (2024, archive). None in HR, SI or ME — [boat24.com Melges 24](https://www.boat24.com/en/sailingboats/melges/melges-24/). The boat24 search pages returned HTTP 403 to the headless browser; WebFetch worked.
- listingsport (aggregates boat24, YachtWorld, Boattrader, Apollo Duck, Facebook Marketplace): 6 listings, USA/DE/CH plus one unlocated Apollo Duck ad. None in the Adriatic — [listingsport](https://www.listingsport.com/hr/sailboats/melges/24/for-sale)
- "\"Melges 24\" for sale Croatia" returned only cruising-yacht pages (Yachtall Croatia sailboats, theyachtmarket Croatia, boats.com Bavaria/Salona) — [yachtall Croatia sailboats](https://www.yachtall.com/en/sailboats/croatia?pg=24)
- Apollo Duck (.eu) returned "Service Unavailable" to the headless browser — [apolloduck.eu](https://www.apolloduck.eu/feature.phtml?id=&search=melges+24)

### Inferences
- Croatian or Slovenian Melges 24s do not currently reach the pan-European brokerage portals. The pan-European researcher's Italian finds (boat24 751393 on Lago Maggiore, iNautia Monfalcone 2001 from the earlier round) are the nearest boats to the Croatian market. Monfalcone (Gorizia) is about 2–3 hours by road from Istria and Kvarner.

### Gaps
- iNautia, Band of Boats, Topboats, Yachtall and Boatshop24 were not searched model-by-model with a Croatia filter in this pass. They are covered by the pan-European researcher, and no Adriatic hits surfaced in web searches.
