# Garmin Varia RearVue 820 (010-03180-00): Black Friday / Black Week / Cyber Monday 2026 deals in non-DE/AT/HU European webshops that ship to Hungary

Research date: **2026-11-05**. Every price and term below was read on 2026-11-05 unless a different date is given. "Seen 2026-11-04" refers to the baseline from the earlier price research. Product identity is checked by part number **010-03180-00** and EAN **753759357467**: Probikeshop and Cicli Drigani show the EAN in their Shopify product JSON, and Svijet Medija and A2U show the part number. This is not the RTL515, RTL516, RCT715 or eRTL615. Where 2025 data on those older models appears, it is used **only** as a labelled historical pattern.

FX (ECB, 2026-11-04): 1 EUR = 363.03 HUF = 24.309 CZK = 4.3990 PLN = 0.83460 GBP. All conversions are my own arithmetic.

Key dates: Black Friday is **Fri 27 Nov 2026** and Cyber Monday is **Mon 30 Nov 2026**. Svijet Medija's Black Month page gives the same dates ([Svijet Medija Black Month](https://www.svijet-medija.hr/black-friday-hrvatska-2026-black-month-akcije-u-svijetu-medija), search snippet), and so does Tradeinn ([Tradeinn BF page](https://www.tradeinn.com/trekkinn/en/black_friday/st)). Note: the Czech site Život s Garminem wrote on 4 Nov 2026 that Black Friday is "v pátek 26. listopadu". That is wrong for 2026, because 26 Nov 2026 is a Thursday ([zivotsgarminem.cz](https://www.zivotsgarminem.cz/black-friday-fenixy-8-pod-14-tisic-venu-x1-za-12-pul-tisice-zlevnily-i-dalsi-modely-vc-edge-ci)).

---

## Q1. Tradeinn/Bikeinn BF15 and CM15: exact terms, do they apply to the RearVue 820, and what did 2025 look like?

### Takeaway
BF15 and CM15 are real 2026 codes worth −15% "on most products". The **app gets early access from Fri 20 Nov 2026**, and **web and app both get it from Mon 23 Nov**. The codes are "not applicable to certain products" and cannot be combined with other offers. Tradeinn publishes no minimum spend, no cap and no brand list. Tradeinn's own public site JavaScript shows that eligibility is decided per product: by brand, model, sub-family and country lists, and by a **minimum-margin rule (30% by default for in-catalogue items)**. Low-margin Garmin electronics may therefore be silently excluded. As of 2026-11-05 the RearVue 820 page shows only "Price without code", and BF15/CM15 are not yet in the live code feed. Whether it applies **cannot be confirmed until 20 or 23 Nov**. If it applies, the delivered HU price would be **≈83,170 Ft (≈€229.10)**: 97,845 Ft × 0.85, with HU VAT already included and free shipping.

### Cited Findings

**(c) Announced, not started: Tradeinn Black Friday 2026 terms**
- Dates from the official page: "Black Friday starts early in the APP: Friday, November 20, 2026" and "Black Friday on all platforms: from Monday, November 23, 2026". Black Friday is 27 Nov and Cyber Monday is 30 Nov 2026. "APP users get priority access." — [Tradeinn BF 2026 (EN, Trekkinn)](https://www.tradeinn.com/trekkinn/en/black_friday/st)
- Codes: **BF15 (−15%)**, with the Black Friday banners labelled "Only in the App", and **CM15 (−15%)** for Cyber Monday. The page offers "15% extra discount on most products across our stores" but only "**5% extra discount on Techinn and Bricoinn**". — [Tradeinn BF 2026 (EN)](https://www.tradeinn.com/trekkinn/en/black_friday/st); [Tradeinn BF 2026 (ES)](https://www.tradeinn.com/es/black_friday/st)
- Validity text: "Discount code valid until 29/11/2026". The English page puts this next to CM15, which conflicts with Cyber Monday on 30/11. The Spanish page reads simply "válido hasta 29/11/2026". **This is a source inconsistency and should be re-checked on the day.** — [Tradeinn BF (EN)](https://www.tradeinn.com/trekkinn/en/black_friday/st); [Tradeinn BF (ES)](https://www.tradeinn.com/es/black_friday/st)
- Exclusions and stacking: "Promotional codes are not applicable to certain products and cannot be combined with other promotions"; "Consultar validez añadiendo un producto en la cesta de compra" (check validity by adding the product to the basket). — [Tradeinn BF (ES)](https://www.tradeinn.com/es/black_friday/st)
- Not stated anywhere on the page: minimum spend, maximum discount cap, named excluded brands. — [Tradeinn BF (EN)](https://www.tradeinn.com/trekkinn/en/black_friday/st)
- Returns: "Orders placed from 20 November to 10 December 2026 can be returned within 45 days." A user account is required to check out. — [Tradeinn BF (EN)](https://www.tradeinn.com/trekkinn/en/black_friday/st)
- It is unclear whether BF15 stays app-only after 23 Nov. The page says deals open "on all platforms" from 23 Nov, but the code banners keep the "Only in the App" label. — [Tradeinn BF (EN)](https://www.tradeinn.com/trekkinn/en/black_friday/st)

**State of the RearVue 820 product page (2026-11-05)**
- Bikeinn product page (shop id 4, model id 143138425, brand id 78): the price block is labelled "**Price without code**". A hidden `js_rectangle_codigo_descuento` element is where an applicable code ("-X% | Code: XXXX") would appear, and it is empty now. The page footer carries the generic banners "Black friday -15% Only in the App | Code: BF15" and "CM15". — [Bikeinn RearVue 820](https://www.tradeinn.com/bikeinn/en/garmin-luz-trasera-varia--rearvue-820/143138425/p)
- Baseline (seen 2026-11-04): 97,845 Ft with Hungary selected, "VAT & duties included", "No extra charges at delivery", free shipping. That is ≈€269.52. — [Bikeinn RearVue 820](https://www.tradeinn.com/bikeinn/en/garmin-luz-trasera-varia--rearvue-820/143138425/p)
- How eligibility works, from Tradeinn's public front-end script `base.min.js` (function `codigos_descuento_pricing` / `condiciones_codigos_descuento`):
  - Each code carries lists of included and excluded countries, brands (`marcas`), models, excluded models, sub-families and excluded sub-families.
  - It also carries margin thresholds. For an in-catalogue product, the code is shown only if the product's margin is at least `margen_catalogado`, which **defaults to 30%** when it is not set. The threshold is 5 points higher for zero-VAT destinations.
  - Discontinued stock has separate, lower thresholds (15/18/20% defaults).
  - [Tradeinn base.min.js](https://www.tradeinn.com/js_new/base.min.js?version_tradeinn=45&version=12&prod=99)
  - I did **not** retrieve per-product cost data; an attempt was blocked by my tool permissions and was not pursued. The product's actual margin, and therefore its eligibility, is unknown.
- Live code feed for Bikeinn (`/dscp/…/4`, 2026-11-05): 8 active codes, all brand- or model-specific: A15P (model list), 10BK26 (Giant/Liv), WWCAS10 (Castelli), R15NN (Altra), SPIDI20, 26BK (Scott), SURT10 (Revit), ADVSPI10 (Spidi). **None is a Garmin code, and BF15/CM15 are not yet in the feed.** Two of them (A15P, WWCAS10) exclude country id 91. On Tradeinn's country selector, id 91 is Hungary (seen 2026-11-04). — [Tradeinn code feed](https://www.tradeinn.com/dscp/0512/1/4)

**(d) Historical pattern: Tradeinn Black Friday 2025**
- 2025 code: **15BF**, "15% EXTRA de descuento desbloqueado en todas las tiendas TRADEINN", "válido hasta 30/11/25". Seen only as a search snippet of a Tradeinn X post dated about 25 Nov 2025. — [Tradeinn on X](https://x.com/tradeinnsl) (snippet)
- A search snippet claims a Trekkinn Garmin watch page showed "Black Friday -15% Code: 15BF". That is the same site-wide footer banner seen on every product page, so it is **not proof** that the code applied to Garmin. — [Trekkinn Garmin watches](https://www.tradeinn.com/trekkinn/en/electronics-watches/garmin/14408-78/sm) (snippet)
- Bikeinn's Black Friday 2025 Garmin deal on Pepper.pl: **Varia RTL515 at 528.99 zł** (≈€120 at today's rate; next-best price 599 zł), posted 22 Nov 2025, 320° temperature. The thread data shows **no voucher code**, so this was a plain price cut, not 15BF. — [Pepper.pl search "garmin varia"](https://www.pepper.pl/search?q=garmin%20varia); [thread](https://www.pepper.pl/promocje/radar-garmin-varia-rtl-515-1162773) (expired, no body text)
- Dealabs shows TradeInn Varia deals just after Black Friday 2025: **RCT715 €285.99** (18 Dec 2025) and **RTL515 €118.99** (30 Dec 2025, vs next best €199.99). — [Dealabs search "garmin varia"](https://www.dealabs.com/search?q=garmin%20varia)

### Inferences
- BF15 is a −15% "extra" on Tradeinn's dynamic destination price. It would bring the RearVue 820 to **≈83,170 Ft / €229.10 delivered**, the best EU price found, but only if the product clears the margin and brand filters. Garmin's dealer margins on new-generation electronics are typically thin, and the 30% default margin gate makes exclusion plausible. **I'd put the chance that BF15 applies at about 40–50%.** This is a judgement, not a sourced figure.
- Bikeinn is not Techinn, so the 5% Techinn/Bricoinn rate should not apply. The RearVue 820 is listed in Bikeinn (shop id 4).
- How to check on the day: open the product page with Hungary selected. If a code applies, the page shows "-15% | Code: BF15" next to the price. Otherwise add it to the basket in the app from 20 Nov.
- Tradeinn's destination prices move daily, so the base 97,845 Ft could itself change before 20 Nov.

### Gaps
- Tradeinn's full T&Cs for BF15/CM15 (named exclusions, cap, minimum order) are not published on the BF page. Its "Términos y Condiciones" link was not retrieved.
- Unclear whether BF15 needs the app after 23 Nov, and whether 29/11 is the end date of BF15 or of CM15.
- No 2025 evidence found that 15BF was or was not accepted on Garmin items.

---

## Q2. Svijet Medija garmin25: verified terms, and other Croatian/Slovenian Garmin-dealer Black Friday promos

### Takeaway
The code **garmin25 (−25%)** is verified on both the product page and Svijet Medija's Garmin campaign page. It is valid **2–30 Nov 2026 or while stocks last**, online and in store, for one-off payment or up to 12 instalments. The VUE 820WW (010-03180-00) is listed in the campaign at €299 with "Dodatnih 25% uz promo kod" and shows "Raspoloživo odmah!". The price is **€224.25** before shipping. No restriction to Croatian addresses is stated. However, EU shipping is quoted only after the order is placed, and nothing confirms that the code survives that manual step. No other HR/SI Garmin dealer has a comparable live promo on the 820.

### Cited Findings

**(b) Live code that plausibly applies: Svijet Medija (HR)**
- Product page: "Cijena: 299,00 €". "Uz promo kod **garmin25** ostvarite 25% popusta za jednokratna plaćanja i obročna plaćanja do 12 rata." "Popust vrijedi za kupnju putem webshopa i u poslovnicama prilikom plaćanja na blagajni." "Promocija traje od 2.11. do 30.11.2026. ili do isteka zaliha!" The cart shows a €74.75 saving, so the price is **€224.25**. Stock: "Raspoloživo odmah!" at the webshop and several stores. Croatian shipping is €7. — [Svijet Medija product page](https://www.svijet-medija.hr/art/straznje-svjetlo-garmin-varia-vue-820ww-radar-010-03180-00/211838)
- Campaign page "Ostvarite odlične popuste na odabrani Garmin asortiman":
  - "Ostvarite do 47% popusta na odabrani Garmin asortiman uz promo kod."
  - Products "imaju naveden promo kod koji će nakon unosa u košarici umanjiti cijenu za navedeni postotak."
  - Validity: "Promocija vrijedi od 2.11. do 30.11.2026. ili do isteka zaliha. Za odabrane artikle promocija vrijedi od 3.11. do 30.11.2026. ili od 3.11. do 18.11.2026. ili do isteka zaliha."
  - The page lists about 120 products. Among them is "Stražnje svjetlo GARMIN Varia VUE 820WW radar, 010-03180-00 | 299,00€ | Dodatnih 25% | uz promo kod", shown as "Raspoloživo odmah!". Also listed: Varia VUE front camera light 010-02911-00 at €539, +15%.
  - [Svijet Medija Garmin promo](https://www.svijet-medija.hr/promocije/ostvarite-odlicne-popuste-na-odabrani-garmin-asortiman)
- Campaign index: the Garmin promo is listed as valid 2.11.–30.11.2026 "ili do isteka zaliha", next to other Black Month brand promos (Xiaomi, LG Black Friday and others). — [Svijet Medija Promocije](https://www.svijet-medija.hr/promocije)
- Comparison site Nabava.net shows **€224.25, InStock** for Svijet Medija on 2026-11-05. — [Nabava.net](https://www.nabava.net/svjetla-i-bljeskalice/garmin-varia-vue-820ww-cijena-859138851)
- Foreign delivery: "Svijet medija dostavlja proizvode i u sve ostale članice EU. Za ostale članice EU trošak dostave izračunava se naknadno nakon kreirane narudžbe." The page names no country and says nothing about promo codes, prices or payment methods for foreign orders. The "only the most expensive shipping fee" rule "vrijedi samo za dostave na području Hrvatske". Phone: 01 6399 222. — [Svijet Medija Dostava](https://www.svijet-medija.hr/dostava)
- Combinability with other discounts, and legal terms ("pravila"), are not stated on either page. — [Svijet Medija Garmin promo](https://www.svijet-medija.hr/promocije/ostvarite-odlicne-popuste-na-odabrani-garmin-asortiman)
- Black Month: the store's 2026 page frames the whole of November as "Black Month", with extra offers during Black Week and on Cyber Monday (30 Nov 2026). The page body was not readable; it is mostly encoded image data, and the details come from a search snippet. — [Svijet Medija Black Month](https://www.svijet-medija.hr/black-friday-hrvatska-2026-black-month-akcije-u-svijetu-medija)

**Other HR/SI Garmin dealers (2026-11-05)**
- **Keindl Sport (HR):** €299.99, no promo on the 820. The site has a "Black Friday" category. Its newsletter −10% "vrijedi za sve proizvode po redovnoj cijeni, osim za bicikle, e-bicikle te proizvode brendova **Garmin** i Bryton. Popust se ne zbraja s drugim popustima." — [Keindl Sport](https://keindl-sport.hr/garmin-varia-vue-straznje-svjetlo-820-proizvod-58811/)
- **Bikeunion.hr:** €299.00, no promo visible. It is part of a group that also runs bikeunion.hu, which is a Hungarian shop and out of scope. — [Bikeunion.hr](https://www.bikeunion.hr/straznja-svjetla/garmin-varia-radar-za-bicikle-rearvue-820/)
- **Maxisport (SI):** €269.96, unchanged since 2026-11-04, no Black Friday mark on the product. — [Maxisport](https://www.maxisport.si/kolesarski-dodatki/sportni-racunalniki/dodatki-za-sportne-racunalnike/garmin-varia-rearvue-820-kolesarski-radar)
- **A2U (SI):** €269.95 "A2U CENA", in stock, "Dostava: 1-8 delovnih dni", no Black Friday code visible. — [A2U](https://www.a2u.si/izdelek/radar-varia-rearvue-820/)
- **Bokal Sport (SI):** €259.24, "Pri posameznem nakupu je možno uporabiti samo 1 kodo". It delivers only to SI and HR, so it belongs in the reference section. — [Bokal Sport](https://www.bokal-sport.si/garmin-varia-rearvue-820-010-03180-00)
- **11-11.si** and **MTBIKER.shop** returned HTTP 403 to automated access, so their prices and promos are not verified. — [11-11.si](https://www.11-11.si/en/zadnja-luc-garmin-varia-rearvue-820); [MTBIKER](https://www.mtbiker.shop/shop/electronics-and-lights/lights/rear/garmin-varia-rearvue-820-taillight-with-radar-p384121.html)
- **Garmin's own HR promo:** the 2025 "Uvjeti i odredbe za promociju Black friday rasprodaja 2025" page (garmin.com/hr-HR) now returns 404, so its 2025 terms cannot be read. No 2026 garmin.com HR/SI Black Friday page was found. — [Garmin HR promo URL](https://www.garmin.com/hr-HR/promotions/holiday-flash-sale-emea/)
- **Other HR retailers** (Ronis, Chipoteka, eKupi) advertise Garmin Black Friday 2026 discounts on **watches** (up to 20–30%). No Varia/820 item was seen in the snippets. — [Ronis](https://www.ronis.hr/garmin-bf); [Chipoteka](https://www.chipoteka.hr/garmin-black-friday-satovi); [eKupi](https://www.ekupi.hr/hr/Black-Friday/Pametni-satovi---Black-Friday-2025/c/BF024) (search snippets)

### Inferences
- Delivered estimate for Svijet Medija with garmin25:
  - Goods: €224.25 = **81,409 Ft**.
  - If the shop applies Hungarian 27% VAT under OSS, as large EU distance sellers must: €224.25 / 1.25 × 1.27 = **€227.84 (82,712 Ft)**.
  - Plus an unknown EU parcel fee. Assuming €15–30, the total is **≈86,900–93,600 Ft**.
  - That makes it the cheapest **live** option today, and probably still cheaper than Tradeinn even if BF15 applies (≈83,170 Ft), once shipping is added.
- Risk: foreign orders are priced manually after the order is placed, so the code might be refused or the shipping fee might be high. **Phone or email the shop to confirm before paying.** The "3.11.–18.11." early-end clause applies to unnamed "selected items". The 820's own page says 2–30 Nov, but buying before 18 Nov removes that risk.
- Warranty: an earlier finding notes that a Slovenian dealer states Garmin's manufacturer warranty applies only in its home territory. Claims for an HR/SI unit would run through the seller (EU 2-year legal guarantee).

### Gaps
- The exact Svijet Medija shipping fee to Hungary, the payment methods for foreign orders, and whether garmin25 is honoured on non-HR delivery addresses. None of these is published.
- The full Svijet Medija promotion rules (pravila nagradne/promotivne akcije) were not found.
- No garmin.si or garmin.hr (Garmin Adriatic) Black Friday 2026 campaign page was found.

---

## Q3. Is the RearVue 820 already discounted (early Black Week) at the listed shops or others, and does each ship to Hungary?

### Takeaway
On 2026-11-05 there is **no new early Black Week price cut** on the RearVue 820 at any EU shop that ships to Hungary. Prices are the same as or within €0.10 of the 2026-11-04 baseline. Two shops already market their current price as Black Friday:
- **Cicli Drigani (IT)** runs "Black Friday per tutto novembre", with extra discounts already shown in the catalogue: **€249 + €9.90 to HU**.
- **Probikeshop (FR)** tags the 820 "BF", but its HU price is high at 111,200 Ft.

Alltricks' Black Weeks reportedly start **13 Nov 2026** (search snippet; the page itself returns 403). Amazon storefronts could not be priced for a Hungarian address.

### Cited Findings

**(a) Live product discounts or Black-Friday-labelled prices, shipping to HU**
- **Cicli Drigani (IT):**
  - Shopify JSON: price **€249.00**, compare-at €299.99, available.
  - Homepage banner: "BLACK FRIDAY PER TUTTO NOVEMBRE — Extra sconti già visibili direttamente a catalogo, online e in negozio."
  - HU shipping is "Standard Internazionale" €9.90 (seen 2026-11-04).
  - [Cicli Drigani product](https://ciclidrigani.it/en/products/garmin-varia-rearvue-radar-and-tail-light-820); [Cicli Drigani home](https://ciclidrigani.it/en)
- **Probikeshop (FR):**
  - The product is tagged **"BF"** (Black Friday collection).
  - HU price **111,200 Ft** (111,400 Ft on 2026-11-04), FR price €279.90, no compare-at price, available.
  - The Black Friday collection page itself shows Garmin items such as the Varia RTL515 at €139.90 (RRP €199.99) and the Edge 1040 Solar at €449.90.
  - [Probikeshop JSON (HU)](https://probikeshop.fr/products/eclairage-arriere-garmin-varia-rearvue-820.js?country=HU); [Probikeshop BF collection](https://probikeshop.fr/collections/black-friday)
- **Tradeinn/Bikeinn (ES):** 97,845 Ft delivered (baseline 2026-11-04). No code applies yet; see Q1. — [Bikeinn](https://www.tradeinn.com/bikeinn/en/garmin-luz-trasera-varia--rearvue-820/143138425/p)
- **Materiel-velo (FR):** **€278.99**, InStock. "Black Friday" badges appear on other products on the page (Bryton, Garmin Edge 1050 €599.99) but not on the 820's price block. HU shipping cost not found (FAQ: Europe delivery about 1 week longer). — [Materiel-velo](https://www.materiel-velo.com/1891486-eclairage-arriere-radar-garmin-varia-rearvue-820.html)
- **Rêve de Vélo (FR):** **€279** (unchanged), with HU Zone 4 Colissimo €25.90, giving €304.90. — [Rêve de Vélo](https://www.revedevelo.com/fr/eclairage-arriere/3999-garmin-varia-rearvue-820-eclairage-arriere-radar-velo.html)
- **Maxisport (SI)** €269.96, **A2U (SI)** €269.95 (+ about €20.89 EU parcel), **Keindl (HR)** €299.99: no Black Friday cut on 2026-11-05. — sources in Q2.

**(c) Announced, not started**
- **Alltricks (FR):** a search snippet of Alltricks' own Black Friday page says Black Friday/Black Weeks start **Fri 13 Nov 2026**, with Black Friday on 27 Nov. The page and the product page return **HTTP 403** to automated access, so this is unverified. Last known product price: €279.99 (snippet, 2026-11-04). — [Alltricks Black Friday](https://www.alltricks.fr/surl/black_friday) (403; snippet); [Alltricks product](https://www.alltricks.fr/F-11917-eclairage/P-3222070-eclairage_arriere_avec_radar_velo_garmin_varia_rearvue_820) (403)
- **Deporvillage (ES):** the product page returns 403. No 2026 Black Friday dates or code were found. Coupon sites mention a past "BF10" (−10% extra for Black Friday), marked expired and undated. — [Deporvillage](https://www.deporvillage.net/garmin-varia-rearvue-820-rear-light-and-radar) (403); [Topnegozi Deporvillage](https://www.topnegozi.it/deporvillage) (snippet)
- **Amazon IT/FR/ES/PL:** no official 2026 Black Friday Week start date. Italian press say it is expected around 20 Nov but **not confirmed** by Amazon. — [Skuola.net](https://www.skuola.net/guide/black-friday-2026-offerte.html); [Idealista](https://www.idealista.it/news/node/496097)
- **Garmin category, general timing:** the5krunner's 2026 guide (updated 31 Oct 2026) says "Early deals started around 20 November last year". — [the5krunner](https://the5krunner.com/best-garmin-black-friday-cyber-monday-deals/)

**Amazon storefronts (ASIN B0GL8MWFWG), checked 2026-11-05**
- The pages rendered with a **US delivery location** ("Deliver to: United States"), so no HU-address price could be read:
  - amazon.it and amazon.fr: no buy-box price shown for that location.
  - amazon.es: €351.14, the same cross-border import offer as seen on 2026-11-04.
  - amazon.pl: no price.
- "Black Friday Deal" and "Cyber Monday" strings appear only as template labels, not as a deal on this ASIN.
- [Amazon.it](https://www.amazon.it/dp/B0GL8MWFWG); [Amazon.fr](https://www.amazon.fr/dp/B0GL8MWFWG); [Amazon.es](https://www.amazon.es/dp/B0GL8MWFWG); [Amazon.pl](https://www.amazon.pl/dp/B0GL8MWFWG)

**Other shops checked (no HU shipping evidence, or no change)**
- Mantel (NL) €279.95 (JSON-LD also shows €314.95) and Futurumshop (NL) €289.95 (€239.63 ex-VAT). Neither shows a Black Friday cut, and the earlier research found no sign of HU shipping. — [Mantel](https://www.mantel.com/en/garmin-varia-rearvue-820); [Futurumshop](https://www.futurumshop.nl/garmin-varia-rearvue-820-achteruitkijk-radar.phtml)
- i-run.fr returns 403. — [i-run](https://www.i-run.fr/electronique/Radars-eclairage-velo_c1162/Garmin_m97/Garmin-Varia-RearVue-820_Garmin_fiche_147217.html)

### Inferences
- Cicli Drigani's €249 is effectively its Black Friday price, live all of November, with no code needed. Delivered: €258.90 = **93,988 Ft**.
  - If Shopify re-prices the item to Hungarian 27% VAT at checkout: €249 / 1.22 × 1.27 + €9.90 = **€269.10 = 97,693 Ft**.
  - I could not verify this. A `?country=HU` JSON request returned non-JSON, while `?country=IT` returned €249.
- Probikeshop's "BF" tag has not translated into a lower HU price. Watch for a markdown from about 23 Nov.
- Watch dates in order of start: Alltricks (13 Nov, unverified), Tradeinn app (20 Nov), Amazon (about 20 Nov, unconfirmed), Tradeinn web (23 Nov), Black Friday (27 Nov), Cyber Monday (30 Nov).

### Gaps
- Alltricks, Deporvillage and i-run prices and Black Friday terms (403). Amazon HU-address prices.
- Materiel-velo HU shipping fee.
- Whether Probikeshop will cut the 820 further during Black Week.

---

## Q4. Deal communities: RearVue 820 and Varia threads (2026 current; 2025 as historical pattern)

### Takeaway
No live RearVue 820 deal exists on any community checked. The 820's community history in 2026 is small:
- One Dealabs deal at €279.95 (May 2026).
- Four Pepper.pl deals between 1,129 and 1,165 zł (Aug–Oct 2026). All are expired, and all are from PL-only shops.

Chollometro and hotukdeals have **no** RearVue 820 threads, Pepper.it **closed on 14 Aug 2025**, and nothing turned up on Pepper.com (NL) or Svijet popusta.

The Black Friday 2025 pattern for the older RTL515 was a low of **≈€109–120 / £106**. That was about 15% below its pre-BF street price (€139.99) and 40–45% below RRP (€199.99), and the best prices appeared around **21–28 Nov 2025**.

### Cited Findings

**2026 RearVue 820 threads (all expired)**
- **Dealabs:** "Radar Garmin Varia RearVue 820 (cycles-zanet.com)", **€279.95** (next best €299.99), posted 2026-05-19, expired. This is the only 820 thread. — [Dealabs search "rearvue 820"](https://www.dealabs.com/search?q=rearvue%20820)
- **Pepper.pl** — [Pepper.pl search "rearvue 820"](https://www.pepper.pl/search?q=rearvue%20820):
  - RTV Euro AGD **1,164.99 zł** (next best 1,219 zł), 2026-08-01
  - RTV Euro AGD **1,164.99 zł** (next best 1,289 zł), 2026-08-19
  - RTV Euro AGD **1,159 zł** (next best 1,213 zł), 2026-10-09; it ended 31 Oct per the earlier research
  - **Centrum Rowerowe 1,129 zł** (≈€256.65; next best 1,159 zł; free shipping; 42 comments), 2026-10-22, expired
- **Chollometro** and **hotukdeals:** searches for "rearvue 820" returned **0** threads. — [Chollometro search](https://www.chollometro.com/search?q=rearvue%20820); [hotukdeals search](https://www.hotukdeals.com/search?q=rearvue%20820)
- **Pepper.it:** the site title reads "Pepper.it ha chiuso i battenti il 14 agosto 2025", so the community no longer exists. — [Pepper.it](https://www.pepper.it/search?q=rearvue%20820)
- **Pepper.com (NL):** no Varia/RearVue result; the only "radar" hit was an unrelated app. — [Pepper.com search](https://www.pepper.com/search?q=rearvue)
- **Svijet popusta (HR):** no Varia/820 deal found by web search. — search only, no page found
- **Czech press roundup (4 Nov 2026):** Život s Garminem's Black Friday article lists the Varia RearVue 820 at **Ski and Bike for 6,290 Kč** ("není sleva až tak výrazná"). Prices are as of 4 Nov 2026. Ski and Bike ships CZ only, so it is in the reference section. — [zivotsgarminem.cz](https://www.zivotsgarminem.cz/black-friday-fenixy-8-pod-14-tisic-venu-x1-za-12-pul-tisice-zlevnily-i-dalsi-modely-vc-edge-ci)

**(d) Historical pattern: Black Friday 2025 Varia deals (older models, not the 820)**
- **Dealabs** — [Dealabs search "garmin varia"](https://www.dealabs.com/search?q=garmin%20varia):
  - RTL515 on Amazon **€118.99** (next best €139.99), 2025-11-21
  - RTL515 on Amazon.com.be **€108.99 with code BLACK10** (next best €199.99), 2025-11-23
  - RTL515 at Decathlon **€119.99** (next best €139.99), 2025-11-28
  - TradeInn RTL515 €118.99 (2025-12-30) and RCT715 €285.99 (2025-12-18)
- **Chollometro** — [Chollometro search "garmin varia"](https://www.chollometro.com/search?q=garmin%20varia):
  - RTL515 on Amazon **€118.99** (next best €199.99), 2025-11-21
  - RTL515 at Decathlon **€118.99** (next best €169.99), 2025-11-24
- **hotukdeals** — [hotukdeals search "garmin varia"](https://www.hotukdeals.com/search?q=garmin%20varia):
  - RTL515 on Amazon **£105.99** (≈€127), 2025-11-23
  - RTL515 on Amazon Spain **£97.95 with new-user app code ENJOY10**, 2025-11-21
  - Refurbished RTL515/516 via eBay "GPS Gadgets" at £40–£65 in mid-Nov 2025 (refurbished, not comparable)
- **Pepper.pl** — [Pepper.pl search "garmin varia"](https://www.pepper.pl/search?q=garmin%20varia):
  - RTL515 on Amazon.pl 563.06 zł, 2025-11-21
  - RTL515 at **Bikeinn 528.99 zł**, 2025-11-22
  - RTL515 at Deporvillage 529.15 zł, 2025-11-26
  - RTL515 at Decathlon 519.99 zł, 2025-11-26
  - These are ≈€118–128 at today's rate.
- **Garmin-wide Black Friday 2025 depth:** "Watches launched that year got 8% to 18% off"; "current Garmin watches typically dropped by 10% to 15%". — [the5krunner 2026 guide](https://the5krunner.com/best-garmin-black-friday-cyber-monday-deals/)
- **UK Black Friday roundups (year ambiguous, 2024 or 2025):** RTL515 £169.99 → £127.99 at Tredz and £129 at Amazon, about 25% off. US RCT715 $399.99 → $349.99 (−13%). — [BikeRadar](https://www.bikeradar.com/news/black-friday-garmin-deals); [Cyclingnews](https://www.cyclingnews.com/cycling-tech-components/live/deals/black-friday-garmin-deals-live) (snippets; the year could not be confirmed)

### Inferences
- In 2025 the RTL515 was six years old and already discounted, so its −40% off RRP is **not** a fair guide for the 820, which launched in February 2026. A better guide is the 8–18% that same-year Garmin models got. Applied to the 820's €299.99 RRP, that suggests Black Friday prices of roughly **€245–275** at mainstream shops. Svijet Medija's −25% code (€224.25) and Tradeinn's possible BF15 (≈€229) already beat that range.
- Deal peaks in 2025 clustered on **21–28 Nov**, which is consistent with Tradeinn's 20/23 Nov start and Amazon's expected about 20 Nov start.
- Codes worth knowing from the 2025 pattern: Amazon.com.be "BLACK10" and the Amazon app new-user code "ENJOY10". Both are 2025 codes and expired.

### Gaps
- Individual Pepper/Dealabs thread pages returned HTTP 410 or a captcha to direct fetch. Comment threads, for example on whether Bikeinn's 2025 codes worked on Garmin, could not be read.
- No Svijet popusta (HR) result could be confirmed.

---

## Q5. Consolidated list: effective delivered price to Hungary, confidence, source, date

### Takeaway
Best options as of 2026-11-05:
1. **Svijet Medija with garmin25**: €224.25 + an unknown EU shipping fee, ≈86,900–93,600 Ft. It is live now, but whether the code works on a foreign order is unconfirmed.
2. **Tradeinn with BF15, if eligible**: ≈83,170 Ft delivered, starting 20 Nov in the app and 23 Nov on the web. Eligibility is uncertain.
3. **Cicli Drigani**: €258.90 (93,988 Ft) delivered, live all of November.
4. **Tradeinn without a code**: 97,845 Ft.

### Cited Findings

| Category | Shop (country) | Offer / code | Shown price | HU delivery | Effective delivered to HU | Confidence it applies | Date seen | Source |
|---|---|---|---|---|---|---|---|---|
| (b) live code | Svijet Medija (HR) | **garmin25 −25%**, 2–30 Nov 2026 or while stocks last; web and store; one-off payment or ≤12 instalments | €299 → **€224.25** | EU fee "calculated after order" | **81,409 Ft + shipping**; ~82,712 Ft if re-taxed at 27%; est. **86,900–93,600 Ft** with €15–30 shipping | High that the code applies to the product; **medium-low** that it works on a HU delivery (unconfirmed) | 2026-11-05 | [product](https://www.svijet-medija.hr/art/straznje-svjetlo-garmin-varia-vue-820ww-radar-010-03180-00/211838), [promo](https://www.svijet-medija.hr/promocije/ostvarite-odlicne-popuste-na-odabrani-garmin-asortiman), [dostava](https://www.svijet-medija.hr/dostava) |
| (a) live price, labelled BF | Cicli Drigani (IT) | "Black Friday per tutto novembre", price already in catalogue | **€249** (compare-at €299.99) | €9.90 Standard Internazionale | **€258.90 = 93,988 Ft**; ≈€269.10 = 97,693 Ft if re-priced to HU VAT | High | 2026-11-05 | [product](https://ciclidrigani.it/en/products/garmin-varia-rearvue-radar-and-tail-light-820), [home](https://ciclidrigani.it/en) |
| (a) live price | Tradeinn/Bikeinn (ES) | none yet ("Price without code") | 97,845 Ft (HU VAT incl.) | free, DDP | **97,845 Ft (≈€269.52)** | High | 2026-11-04/05 | [Bikeinn](https://www.tradeinn.com/bikeinn/en/garmin-luz-trasera-varia--rearvue-820/143138425/p) |
| (c) announced | Tradeinn/Bikeinn (ES) | **BF15 −15%** (app from 20 Nov, web and app from 23 Nov); **CM15 −15%** (30 Nov); "valid until 29/11/2026" (ambiguous); not valid on "certain products"; no stacking | — | free, DDP | **≈83,170 Ft (≈€229.10)** if eligible | **Low-medium (about 40–50%, my judgement)**: margin, brand and model gating | 2026-11-05 | [BF page](https://www.tradeinn.com/trekkinn/en/black_friday/st), [JS](https://www.tradeinn.com/js_new/base.min.js?version_tradeinn=45&version=12&prod=99), [code feed](https://www.tradeinn.com/dscp/0512/1/4) |
| (a) live price | Maxisport (SI) | none | €269.96 | Pošta Slovenije EU tariff (amount not stated) | 98,004 Ft + shipping | High (price) | 2026-11-05 | [Maxisport](https://www.maxisport.si/kolesarski-dodatki/sportni-racunalniki/dodatki-za-sportne-racunalnike/garmin-varia-rearvue-820-kolesarski-radar) |
| (a) live price | A2U (SI) | none | €269.95 | about €20.89 EU parcel | ≈€290.84 = 105,584 Ft | High | 2026-11-05 | [A2U](https://www.a2u.si/izdelek/radar-varia-rearvue-820/) |
| (a) live price | Materiel-velo (FR) | none on the 820 (BF badges on other items) | €278.99 | ships to Europe, fee unknown | 101,282 Ft + shipping | High (price) | 2026-11-05 | [Materiel-velo](https://www.materiel-velo.com/1891486-eclairage-arriere-radar-garmin-varia-rearvue-820.html) |
| (a) live price | Rêve de Vélo (FR) | "Promo" −€20.99 | €279 | €25.90 Colissimo Zone 4 | €304.90 = 110,688 Ft | High | 2026-11-05 | [Rêve de Vélo](https://www.revedevelo.com/fr/eclairage-arriere/3999-garmin-varia-rearvue-820-eclairage-arriere-radar-velo.html) |
| (a) live price, "BF" tag | Probikeshop (FR) | tagged "BF", no markdown | 111,200 Ft (FR €279.90) | free | **111,200 Ft (≈€306.31)** | High | 2026-11-05 | [JSON HU](https://probikeshop.fr/products/eclairage-arriere-garmin-varia-rearvue-820.js?country=HU) |
| (a) live price | Keindl Sport (HR) | none; newsletter −10% **excludes Garmin** | €299.99 | not checked | 108,905 Ft + shipping | High | 2026-11-05 | [Keindl](https://keindl-sport.hr/garmin-varia-vue-straznje-svjetlo-820-proizvod-58811/) |
| (c) announced | Alltricks (FR) | Black Weeks from 13 Nov 2026 (snippet) | €279.99 (snippet, 2026-11-04) | not verified | n/a | Low (403, unverified) | 2026-11-05 | [Alltricks BF](https://www.alltricks.fr/surl/black_friday) |
| (c) expected | Amazon IT/FR/ES/PL | BF Week expected about 20 Nov (unconfirmed) | no HU-address price | n/a | n/a | Unknown | 2026-11-05 | [Skuola.net](https://www.skuola.net/guide/black-friday-2026-offerte.html) |

### Inferences
- **Recommended action:** contact Svijet Medija now (01 6399 222 or webshop contact) and ask three things: does garmin25 apply to an order delivered to Hungary, what is the shipping fee, and is Hungarian VAT applied? If yes and shipping is ≤ €25, it beats every other option, and the deal is locked in before any "selected items to 18 Nov" risk.
- Fallback: on 20 Nov (app) or 23 Nov (web), check whether Bikeinn shows "-15% | Code: BF15" on the 820 with Hungary selected. If it does, ≈83,170 Ft delivered is the best price found.
- Otherwise Cicli Drigani at €258.90 delivered is the safe, live, no-code option.

### Gaps
- Svijet Medija HU shipping fee and how it handles the code on foreign orders. Cicli Drigani's HU-VAT re-pricing at checkout. BF15 eligibility.

---

## Q6. Reference only: shops that do not ship to Hungary, and UK shops (import VAT and customs warning)

### Takeaway
Czech and Polish shops are cheap: €257–275 equivalent, with some early Black-Week-style markdowns. Every one checked ships domestically only. UK prices look low (Sigma £219.99), but after Brexit a Hungarian buyer pays **27% import VAT plus carrier clearance fees**. That puts UK options at about €279–304 before shipping, which is no better than the EU options.

### Cited Findings

**No HU delivery (reference)**
- **Ski and Bike (CZ):** 6,290 Kč (≈€258.75 / 93,935 Ft), −16% from 7,490 Kč, listed as a Black Friday deal on 4 Nov 2026. Delivery is CZ only. — [zivotsgarminem.cz](https://www.zivotsgarminem.cz/black-friday-fenixy-8-pod-14-tisic-venu-x1-za-12-pul-tisice-zlevnily-i-dalsi-modely-vc-edge-ci); [SkiAndBike](https://www.skiandbike.cz/garmin-varia--rearvue-820/)
- **Trigar (PL):** **1,209 zł** (≈€274.84), "−11%, Najniższa cena z 30 dni przed obniżką: 1 359,00 zł", large stock. A "BlackWeeks" menu entry exists, but no extra 820 discount yet. PL-only delivery. — [Trigar](https://trigar.pl/radar-garmin-varia-rearvue-820)
- **Centrum Rowerowe (PL):** 1,209 zł now. It had a 1,129 zł Pepper deal on 22 Oct 2026, now expired. PL carriers only. — [Centrum Rowerowe](https://www.centrumrowerowe.pl/radar-rowerowy-garmin-varia-rearvue-820-pd56245/); [Pepper.pl](https://www.pepper.pl/search?q=rearvue%20820)
- **Bokal Sport (SI):** €259.24, delivers to SI and HR only. — [Bokal Sport](https://www.bokal-sport.si/garmin-varia-rearvue-820-010-03180-00)
- **Alza (CZ/SK):** product pages returned 403 in the earlier research. Alza serves Hungary through alza.hu, a Hungarian shop that is out of scope. No 2026 Alza Black Friday start date was found; in 2025 Czech retailers such as Alza and Datart started campaigns in early November. — [e15.cz 2025](https://www.e15.cz/black-friday-2025) (snippet)

**UK (separate; import VAT and customs warning)**
- **Sigma Sports:** **£219.99** (≈€263.59), in stock, unchanged. A Black Friday footer link exists. Earlier, the visible SAVE30/50/100 codes were clothing-only. — [Sigma Sports](https://www.sigmasports.com/item/Garmin/VariaTM-RearVue-820-Rear-Radar-Light/170PZ)
- **Tredz:** **£240** (net £200), InStock. "£5 OFF VOUCHER When you spend £50 or more *excluding all bikes" for newsletter sign-up. — [Tredz](https://www.tredz.co.uk/.Garmin-Varia-RearVue-820-Cycling-Radar-with-Trail-Rear-Light_282692.htm)
- **hotukdeals:** no RearVue 820 thread. — [hotukdeals search](https://www.hotukdeals.com/search?q=rearvue%20820)

### Inferences
- UK landed estimate if the shop removes UK VAT for export:
  - Sigma: £183.33 net = €219.66, × 1.27 HU VAT = **€278.97 (≈101,272 Ft)**.
  - Tredz: £200 net = €239.64, × 1.27 = **€304.34 (≈110,484 Ft)**.
  - Both before shipping and courier clearance fees, with possible customs duty if the item is not UK-origin (Garmin hardware is made in Taiwan).
  - Neither beats Svijet Medija, Tradeinn or Cicli Drigani.
- Czech and Polish prices are only useful through a forwarding address in CZ or PL, which is not covered here.

### Gaps
- Sigma Sports' and Tredz's international shipping to Hungary (DDP or DAP) and their fees were not verified.
- No Alza.cz or .sk Black Friday 2026 price for the 820 (403).
