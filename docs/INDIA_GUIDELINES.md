# India: dark-pattern and deceptive-design checklist

This is the rubric the Riptide **platform audit** agent applies when it reads an uploaded web or app codebase (UI components, copy strings, defaults, pricing and fee logic, consent, subscription and cancellation flows, timers, ad labels). Each rule says what a violation and what compliance look like **in source code**, so the agent can decide it with read-only file tools. The same rules, ids and order are in `docs/india-guidelines.json`, which the engine loads for scoring.

**This is a rubric, not legal advice.** It paraphrases Indian law and guidance as of **25 October 2026** and leaves out duties that cannot be checked from code (contracts, KYC, response times, audits done offline). A pass means the code shows no sign of a violation. It does not certify compliance.

Key dates:

| Instrument | Date | Status for this rubric |
|---|---|---|
| Consumer Protection Act, 2019 | in force 20 Jul 2020 | law |
| Consumer Protection (E-Commerce) Rules, 2020 | notified 23 Jul 2020 | law |
| CCPA Guidelines for Prevention of Misleading Advertisements, 2022 | 9 Jun 2022 | guideline, binding under CPA s.18 |
| ASCI Guidelines for Online Deceptive Design Patterns in Advertising | issued 15 Jun 2023, applicable 1 Sep 2023 | self-regulatory |
| CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023 | notified 30 Nov 2023 | guideline, binding under CPA s.18 |
| CCPA self-audit advisory and Joint Working Group | 5 Jun 2025 | advisory |
| DPDP Rules, 2025 | notified 14 Nov 2025; Rule 4 (consent managers) from Nov 2026; Rules 3, 5-16 (notice, children, etc.) from May 2027 | law, phased |
| Legal Metrology (Packaged Commodities) Amendment Rules, 2026 (Rule 6(10A)) | G.S.R. 128(E), 13 Feb 2026; reported in force 1 Jul 2026 | law |
| RBI Digital Payments: E-mandate Framework, 2026 | 21 Apr 2026, effective immediately | RBI directions under the PSS Act |
| Consumer Protection (E-Commerce) (Amendment) Rules, 2026 | notified 9 Sep 2026; **in force 1 Jan 2027** | law (from 2027) |

Rules with a future `effectiveFrom` (the 2026 E-Commerce amendment and the DPDP notice and consent rules) are listed so platforms can prepare. The scoring section below explains how to handle them.

## Sources

Primary sources were read directly unless marked *(secondary)*.

1. **Consumer Protection Act, 2019** (No. 35 of 2019): s.2(9) consumer rights, s.2(28) misleading advertisement, s.2(47) unfair trade practice, s.18 CCPA powers (incl. guidelines), s.20 orders to discontinue practices, s.21 penalties for misleading ads (up to ₹10 lakh, and up to ₹50 lakh for a repeat offence), s.89 offence. https://ncdrc.nic.in/bare_acts/CPA2019.pdf, https://www.indiacode.nic.in. *Section numbers and penalty amounts are confirmed through PIB orders and the NLS note; the Act PDF itself was not re-read for this document.*
2. **CCPA, Guidelines for Prevention and Regulation of Dark Patterns, 2023**, notified 30 Nov 2023 under CPA s.18 (F. No. J-24/34/2023-CPU). Guideline 3 (applies to all platforms systematically offering goods or services in India, advertisers and sellers), Guideline 4 (prohibition), Guideline 5 and Annexure 1 (13 specified patterns). Announced by PIB on 8 Dec 2023: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1983994. Annexure 1 definitions were checked against the text reproduced by NLSIU: https://www.nls.ac.in/wp-content/uploads/2021/04/Dark-Patterns.pdf *(secondary reproduction; the gazette copy at consumeraffairs.nic.in could not be reached)*.
3. **Consumer Protection (E-Commerce) Rules, 2020**, G.S.R. 462(E), 23 Jul 2020. Rule 4(2)-(11), Rule 5(3), Rule 6(5), Rule 7(1). Gazette text: https://www.kanooniyat.com/wp-content/uploads/2020/07/ECommerce-Rule.pdf (mirror of the official notification). DoCA copy: https://consumeraffairs.gov.in/public/upload/files/E%20commerce%20rules_1732703966.pdf
4. **Consumer Protection (E-Commerce) (Amendment) Rules, 2026**, notified 9 Sep 2026, in force 1 Jan 2027. PIB, 10 Sep 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2308759. Clause numbers (4(12) sponsored listings, 4(13) prior price, 4(15) self-audit certificate, 5(7) bundled fees, 4(11)(c) search manipulation) and the number G.S.R. 789(E) come from *(secondary)* https://lexcomply.com/blog/consumer-protection-ecommerce-amendment-rules-2026-6ab1fea397f24 and https://iclg.com/briefing/transparency-by-design-indias-2026-e-commerce-rules-amendment/
5. **CCPA advisory on self-audit for dark patterns**, 5 Jun 2025 (self-audit within 3 months, then self-declaration), and the **Joint Working Group** set up by Office Memorandum of 5 Jun 2025. PIB, 22 Jul 2025: https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2146813. 26 platforms filed self-declarations; CCPA told companies to publish them on their websites. PIB, 20 Nov 2025: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2191948, list at https://www.doca.gov.in/ccpa/slef-audit-companies-dark-pattern.php
6. **CCPA enforcement (worked examples)**
   - PhysicsWallah (₹5 lakh: pre-selected ₹10 donation, emotional copy, 'free' courses gated on phone/email) and McAfee (₹1 lakh: "Renew Now" vs "Accept Risk"). PIB, 3 Jun 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268302. CCPA said consent "cannot be assumed through pre-selected options". Orders: https://jagograhakjago.gov.in/CCPA_Orders/index.html
   - Rapido (₹10 lakh: pay-more prompts during booking held to be confirm shaming; colour-coded price slider held to be interface interference; cites the Motor Vehicle Aggregator Guidelines, 2025 rule that tips come only after the ride). Earlier notices went to Uber, Ola, Rapido and Namma Yatri; the Uber and Ola reviews are ongoing. PIB, 15 Sep 2026: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310526
   - Nine platforms fined about ₹20 lakh in total: Zepto ₹7 lakh (handling fees treated as drip pricing, auto-added membership as basket sneaking), PhysicsWallah ₹5 lakh, Anuj Jindal Academy ₹3 lakh, FirstCry ₹2 lakh, PharmEasy, McAfee and SpiceJet ₹1 lakh each. Also corrective actions: IndiGo changed "No, I will take the risk" to neutral wording, and BookMyShow removed a pre-ticked ₹1 BookASmile donation. Reported from a Rajya Sabha reply *(secondary)*: https://www.ndtv.com/business-news/zepto-bookmyshow-indigo-9-apps-fined-20-lakh-dark-patterns-ccpa-consumer-11872676 (6 Aug 2026)
   - Uber 'advance tip' notice, 21 May 2025 *(secondary)*: https://www.business-standard.com/companies/news/ccpa-notice-to-uber-over-dark-patterns-rapido-ola-under-scrutiny-125052201403_1.html. Ola/Uber notices over iOS vs Android fares, Jan 2025 *(secondary)*: https://bricscompetition.org/news/ccpa-issues-notices-to-ola-uber-over-differential-pricing
7. **Digital Personal Data Protection Act, 2023** (No. 22 of 2023): s.5 notice, s.6(1) consent standard, s.6(3) language and contact, s.6(4) withdrawal, s.9 children. https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
8. **DPDP Rules, 2025**, notified 14 Nov 2025 (CG-DL-E-14112025-267650). Rule 1 commencement (Rules 1, 2, 17-21 immediately; Rule 4 after 1 year; Rules 3, 5-16, 22, 23 after 18 months). Rule 3 notice content (itemised data, purposes, withdrawal as easy as giving). https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf, PIB https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014. *The date sections 5, 6 and 9 of the Act take effect (taken here as 13 May 2027, with the 18-month Rules) was not checked against the separate commencement notification. A proposal to shorten the timeline (reported Jan-Feb 2026) was not confirmed as notified.*
9. **RBI, Digital Payments: E-mandate Framework, 2026**, RBI/DPSS/2026-27/396, 21 Apr 2026. It consolidates the 2019-2024 e-mandate circulars: AFA at registration, first debit, modification and withdrawal; withdrawal at any time; pre-debit notice at least 24 hours ahead with opt-out; AFA-free limit of ₹15,000 (₹1 lakh for insurance, mutual funds and credit-card bills); acquirers must make merchants comply. https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=13374
10. **ASCI, Guidelines for Online Deceptive Design Patterns in Advertising**, 15 Jun 2023, applicable 1 Sep 2023: drip pricing, bait and switch, false urgency, disguised ads. https://www.ascionline.in/wp-content/uploads/2023/05/Guidelines-for-Online-Deceptive-Design-Patterns-in-Advertising.pdf. Self-regulatory, not law. *The ASCI influencer guidelines are cited from general knowledge and were not re-read.*
11. **Legal Metrology (Packaged Commodities) Rules, 2011**, Rule 6(10) (e-commerce entities must show the Rule 6(1) declarations online; inserted 2017, effective 1 Jan 2018), and Rule 6(10A) (country-of-origin filter) inserted by G.S.R. 128(E), 13 Feb 2026, in force 1 Jul 2026 *(secondary)*: https://chambers.com/articles/lmpc-rules-amended-new-compliance-for-e-commerce. DoCA notification: https://consumeraffairs.gov.in/public/upload/files/2026.02.13%20PCR%201st%20COO%20Filter%20on%20e-commerce%20websites_1771231030.pdf
12. **Motor Vehicle Aggregator Guidelines, 2025** (MoRTH): tipping allowed only after the ride. Cited here through the CCPA Rapido release (item 6). *The guidelines were not read directly, and the 1 Jul 2025 date is unverified.*

### Not verified or uncertain
- **Annexure 1 illustrations** of the Dark Patterns Guidelines. Definitions were checked against a reproduction, but the gazette PDF was unreachable, so the official illustrations were not checked word for word. Code examples in this file are Riptide's own, informed by commentary (e.g. "I will stay unsecured" for travel insurance).
- **Nine-platform penalty list and Zepto amount**: from press coverage of a Rajya Sabha reply, not a PIB release.
- **2026 E-Commerce amendment clause numbers**: PIB confirms the substance; sub-rule numbers come from law-firm summaries.
- **DPDP**: the commencement date of Act ss.5, 6 and 9, and whether the proposed shortened timeline was adopted.
- **DPDP (Removal of Difficulties) Order, 2026** (reported 5 Oct 2026, clarifying wording in ss.9 and 10): seen only in a LinkedIn post. It does not change any rule here.

## How the agent should use this

1. Decide applicability first (e.g. does the platform sell subscriptions, show prices, collect personal data, sell packaged goods, run a marketplace). Record the evidence (file paths).
2. For each applicable rule, look for the violation signals (grep for `checked`, `defaultChecked`, `useState(true)`, `Math.random`, `setInterval`, fee constants, `isSponsored`, `cancel`, `unsubscribe`, `consent`, `tip`, `userAgent`/`Platform.OS` in pricing, strings such as "risk", "only", "left", "free", "Sponsored").
3. Mark each rule `pass`, `fail` (cite file:line and the string or default), `not_applicable` (cite why) or `unknown` (the code needed is not in the upload, e.g. a server-side fee service).
4. One finding can break several rules (e.g. a pre-ticked donation fails CCPA-DP-02 and ECOM-4.9). Report each rule separately.

## Summary of rules (40)

| id | category | severity | binding | in force |
|---|---|---|---|---|
| `CCPA-DP-01` | `false_urgency` | high | guideline | 2023-11-30 |
| `CCPA-DP-02` | `basket_sneaking` | critical | guideline | 2023-11-30 |
| `CCPA-DP-03` | `confirm_shaming` | high | guideline | 2023-11-30 |
| `CCPA-DP-04` | `forced_action` | high | guideline | 2023-11-30 |
| `CCPA-DP-05` | `subscription_trap` | critical | guideline | 2023-11-30 |
| `CCPA-DP-06` | `interface_interference` | high | guideline | 2023-11-30 |
| `CCPA-DP-07` | `bait_and_switch` | high | guideline | 2023-11-30 |
| `CCPA-DP-08` | `drip_pricing` | critical | guideline | 2023-11-30 |
| `CCPA-DP-09` | `disguised_ads` | medium | guideline | 2023-11-30 |
| `CCPA-DP-10` | `nagging` | low | guideline | 2023-11-30 |
| `CCPA-DP-11` | `trick_question` | high | guideline | 2023-11-30 |
| `CCPA-DP-12` | `saas_billing` | critical | guideline | 2023-11-30 |
| `CCPA-DP-13` | `rogue_malware` | critical | guideline | 2023-11-30 |
| `CPA-2.28-FREE` | `bait_and_switch` | high | guideline | 2022-06-09 |
| `ECOM-4.9` | `basket_sneaking` | critical | law | 2020-07-23 |
| `ECOM-4.2-4.4` | `grievance_disclosure` | medium | law | 2020-07-23 |
| `ECOM-TOTAL-PRICE` | `pricing_disclosure` | high | law | 2020-07-23 |
| `ECOM-RETURNS` | `product_disclosure` | medium | law | 2020-07-23 |
| `ECOM-PAY-CANCEL` | `recurring_payments` | high | law | 2020-07-23 |
| `ECOM-SELLER-INFO` | `product_disclosure` | medium | law | 2020-07-23 |
| `ECOM-4.6-COO` | `product_disclosure` | medium | law | 2020-07-23 |
| `ECOM-4.11-DISCRIM` | `pricing_disclosure` | high | law | 2020-07-23 |
| `ECOM-RANKING` | `disguised_ads` | low | law | 2020-07-23 |
| `ECOM-4.12-SPONSORED` | `disguised_ads` | high | law | 2027-01-01 |
| `ECOM-4.13-PRIOR-PRICE` | `pricing_disclosure` | high | law | 2027-01-01 |
| `ECOM-4.15-CERT` | `grievance_disclosure` | low | law | 2027-01-01 |
| `ECOM-5.7-BUNDLED-FEE` | `basket_sneaking` | medium | law | 2027-01-01 |
| `DPDP-5-NOTICE` | `data_consent` | medium | law | 2027-05-13 |
| `DPDP-6.1-AFFIRM` | `data_consent` | high | law | 2027-05-13 |
| `DPDP-6.1-UNBUNDLED` | `forced_action` | high | law | 2027-05-13 |
| `DPDP-6.4-WITHDRAW` | `data_consent` | high | law | 2027-05-13 |
| `DPDP-9-CHILDREN` | `data_consent` | high | law | 2027-05-13 |
| `RBI-EMANDATE-1` | `recurring_payments` | critical | law | 2026-04-21 |
| `RBI-EMANDATE-2` | `recurring_payments` | high | law | 2026-04-21 |
| `MVAG-TIP` | `confirm_shaming` | high | guideline | 2025-07-01 |
| `ASCI-DD-1` | `drip_pricing` | medium | self-regulatory | 2023-09-01 |
| `ASCI-DD-2` | `interface_interference` | medium | self-regulatory | 2023-09-01 |
| `ASCI-DD-3` | `disguised_ads` | medium | self-regulatory | 2023-09-01 |
| `LM-6.10` | `product_disclosure` | medium | law | 2018-01-01 |
| `LM-6.10A` | `product_disclosure` | low | law | 2026-07-01 |

## Checklist

### CCPA-DP-01: No false urgency or false scarcity

- **Rule**: No false urgency or false scarcity.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 1 (False Urgency); CPA 2019 s.2(47); see also ASCI deceptive-design Guideline 3 (advertiser must substantiate stock level behind scarcity claims)
- **In force from**: 2023-11-30
- **Category**: `false_urgency`
- **Severity**: `high`. Pressures an immediate purchase with fabricated claims; enforced (timers cited in 2026 penalties).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Countdown/deadline computed client-side from now() or reset on reload/session (e.g. Date.now()+15*60*1000 stored nowhere server-side); stock or 'N people viewing' values from Math.random, hard-coded constants, or a fixed floor not tied to inventory/analytics data.
- **What compliance looks like in code**: Timers read a real server-side offer end date; stock and popularity counts are read from inventory/analytics APIs, or not shown at all.
- **Not applicable when**: Platform shows no timers, stock levels, popularity or scarcity messages.

### CCPA-DP-02: No items, services, donations or charges added to the basket without consent

- **Rule**: No items, services, donations or charges added to the basket without consent.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 2 (Basket Sneaking), incl. proviso for free samples, complimentary services and disclosed necessary fees
- **In force from**: 2023-11-30
- **Category**: `basket_sneaking`
- **Severity**: `critical`. Takes money for something the user never chose (PhysicsWallah, Zepto, BookMyShow orders).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Cart/checkout state initialised with a paid add-on, insurance, membership, tip or donation selected (checked, defaultChecked, useState(true), selected: true, default quantity 1); server adds a paid line item the user did not select.
- **What compliance looks like in code**: Every paid optional line starts unselected and is added only on an explicit user action. Free samples, complimentary services and necessary fees disclosed at purchase (delivery, gift wrap, taxes) are allowed.
- **Not applicable when**: Checkout has no optional paid extras, donations, tips or memberships.

### CCPA-DP-03: No confirm shaming in decline or opt-out copy

- **Rule**: No confirm shaming in decline or opt-out copy.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 3 (Confirm Shaming)
- **In force from**: 2023-11-30
- **Category**: `confirm_shaming`
- **Severity**: `high`. Guilt or fear copy steers money decisions; repeatedly enforced (IndiGo, PhysicsWallah, McAfee, Rapido).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Decline/close/skip strings that shame or frighten, e.g. 'No, I will take the risk', 'Accept Risk', 'I will stay unsecured', 'No thanks, I don't care about my family', or emotional appeals (children's education, health) shown next to the option to remove a donation.
- **What compliance looks like in code**: Neutral, symmetric labels such as 'No, I will not add this' / 'Add insurance'; no fear or guilt messaging attached to the decline path.
- **Not applicable when**: Never applicable as a whole; the agent only marks it N/A if the platform has no upsell, renewal, donation or opt-out prompts at all.

### CCPA-DP-04: No forced action to get the intended product

- **Rule**: No forced action to get the intended product.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 4 (Forced Action)
- **In force from**: 2023-11-30
- **Category**: `forced_action`
- **Severity**: `high`. Forces extra purchases, sign-ups or data sharing as a condition (PhysicsWallah 'free' courses behind phone/email).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Route guards or form validation that require login, phone number, email, app download, newsletter sign-up, membership or an extra item before the user can access or buy the item they wanted, when the item does not need it (e.g. 'free' content gated behind required phone field).
- **What compliance looks like in code**: Only data and steps strictly needed for the purchase or service are required; optional sign-ups are separate, optional and skippable.
- **Not applicable when**: Never fully N/A; only if the platform has no purchase, sign-up or gated content flows.

### CCPA-DP-05: Cancelling a subscription is simple, visible and clear

- **Rule**: Cancelling a subscription is simple, visible and clear.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 5 (Subscription Trap), sub-items (i) to (iv)
- **In force from**: 2023-11-30
- **Category**: `subscription_trap`
- **Severity**: `critical`. Keeps charging users who want to leave.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: No cancel route or button in account/settings code; cancel only via email/phone/chat; cancel flow has more steps than sign-up (retention modals, surveys, 'are you sure' chains); cancel link hidden (tiny, low-contrast, nested menus); a free plan or trial that requires card or auto-debit authorisation; ambiguous cancel instructions.
- **What compliance looks like in code**: A clearly labelled 'Cancel subscription' control reachable from account settings, completed in no more steps than sign-up, with at most one optional retention offer and a clear confirmation; free tiers need no payment details.
- **Not applicable when**: Platform sells no subscriptions, memberships or recurring plans.

### CCPA-DP-06: No interface interference that highlights one choice and hides another

- **Rule**: No interface interference that highlights one choice and hides another.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 6 (Interface Interference)
- **In force from**: 2023-11-30
- **Category**: `interface_interference`
- **Severity**: `high`. Visual manipulation misdirects choices with money or data at stake (McAfee, Rapido slider).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Accept/upsell styled as a large primary button while decline is a small grey text link; fees or key terms in low-contrast or tiny fine print; a close 'X' that triggers accept, navigation or an ad; colour-coded or asymmetric sliders steering to higher amounts.
- **What compliance looks like in code**: Choices with comparable consequences get comparable visual weight; key price and terms are shown at readable size and contrast; close icons only close.
- **Not applicable when**: Never N/A for a platform with any user-facing choice screen.

### CCPA-DP-07: No bait and switch

- **Rule**: No bait and switch.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 7 (Bait and Switch)
- **In force from**: 2023-11-30
- **Category**: `bait_and_switch`
- **Severity**: `high`. Advertised outcome is replaced by a costlier one after the user acts.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Advertised price/variant/SKU replaced at add-to-cart or checkout (e.g. cart uses a different SKU or price field than the listing; 'out of stock' branch that always offers a dearer substitute); deal price only applied to a list the user cannot actually reach.
- **What compliance looks like in code**: The item and price the user clicked are what reaches the cart and payment; unavailability is shown before the user commits, without auto-substituting a dearer product.
- **Not applicable when**: Platform has no advertised offers, listings or deals.

### CCPA-DP-08: No drip pricing: the full price is shown upfront

- **Rule**: No drip pricing: the full price is shown upfront.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 8 (Drip Pricing), (i) to (iv)
- **In force from**: 2023-11-30
- **Category**: `drip_pricing`
- **Severity**: `critical`. User pays more than the price first shown (Zepto handling and membership fees).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Mandatory fees (platform, convenience, handling, service, packaging) added only at a late checkout or payment step; payable amount at payment > price first shown; product or app marketed as 'free' when continued use requires a purchase; a paid service blocked until an extra purchase.
- **What compliance looks like in code**: Listing and product pages show the price including all non-optional fees, or show every fee at the first price display; the total never rises between steps except for options the user picked; 'free' claims disclose any paid continuation.
- **Not applicable when**: Platform takes no payments and shows no prices.

### CCPA-DP-09: Advertising is not disguised as other content

- **Rule**: Advertising is not disguised as other content.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 9 (Disguised Advertisement); CCPA Misleading Advertisements Guidelines, 2022
- **In force from**: 2023-11-30
- **Category**: `disguised_ads`
- **Severity**: `medium`. Misleads about the commercial nature of content, usually without direct money loss.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Paid placements, affiliate posts, influencer content or promoted 'reviews'/'top picks'/'editor's choice' rendered with the same component as organic content and no 'Ad'/'Sponsored'/'Paid partnership' label (e.g. isSponsored flag in data but not rendered).
- **What compliance looks like in code**: Every paid or promoted item renders a visible, persistent disclosure label next to it.
- **Not applicable when**: Platform shows no paid, promoted, affiliate or influencer content.

### CCPA-DP-10: No nagging

- **Rule**: No nagging.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 10 (Nagging)
- **In force from**: 2023-11-30
- **Category**: `nagging`
- **Severity**: `low`. Annoying and coercive, but no direct money or data loss on its own.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Upsell, app-download, notification or sign-up prompts re-shown on every page/step or on a short interval, with no persistent 'don't show again' (dismissal not stored, or prompt reopens on route change).
- **What compliance looks like in code**: Prompts are shown once or rarely, respect a stored dismissal, and do not block the task.
- **Not applicable when**: Platform has no promotional prompts or interstitials.

### CCPA-DP-11: No trick questions or confusing wording

- **Rule**: No trick questions or confusing wording.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 11 (Trick Question)
- **In force from**: 2023-11-30
- **Category**: `trick_question`
- **Severity**: `high`. Confusing wording yields choices users did not mean, often for money or data (McAfee).
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Double negatives or inverted checkbox semantics ('Uncheck to not stop receiving offers', 'Don't not send me updates'); a checkbox whose checked state means opt-out while siblings mean opt-in; button labels that do not match the action.
- **What compliance looks like in code**: Each control states one plain action in positive wording; checked always means 'yes, do this'.
- **Not applicable when**: Platform has no questions, checkboxes or choice prompts.

### CCPA-DP-12: No surreptitious SaaS billing

- **Rule**: No surreptitious SaaS billing.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 12 (SaaS Billing)
- **In force from**: 2023-11-30
- **Category**: `saas_billing`
- **Severity**: `critical`. Recurring money taken without informed, ongoing consent.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Free trial auto-converts to paid with no disclosure of date and amount at sign-up and no reminder logic; renewal price/frequency absent from the plan screen; plan upgrades or seat increases charged without a confirm step; no pre-renewal email/notification job in the code.
- **What compliance looks like in code**: Trial sign-up shows the conversion date, amount and billing period next to the confirm button; code sends a reminder before the first charge and each renewal; upgrades require explicit confirmation.
- **Not applicable when**: Platform has no recurring billing, trials or auto-renewals.

### CCPA-DP-13: No rogue malware or scareware

- **Rule**: No rogue malware or scareware.
- **Source**: Guidelines for Prevention and Regulation of Dark Patterns, 2023, Annexure 1 item 13 (Rogue Malwares)
- **In force from**: 2023-11-30
- **Category**: `rogue_malware`
- **Severity**: `critical`. Deceives users with fake threats to sell a fix; can also harm the device.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Fake 'virus detected' / 'device at risk' / 'phone slow' alerts or scans not backed by any real detection logic, linked to a purchase; code that downloads or installs unrequested executables.
- **What compliance looks like in code**: Security warnings only come from real detection results and never gate a sale; no unrequested downloads.
- **Not applicable when**: Platform sells no security, cleaning or device-performance products and shows no device alerts.

### CPA-2.28-FREE: 'Free' claims disclose every condition

- **Rule**: 'Free' claims disclose every condition.
- **Source**: Consumer Protection Act, 2019 s.2(28) (misleading advertisement); CCPA Guidelines for Prevention of Misleading Advertisements, 2022 (free claims); PhysicsWallah order (PIB, 3 Jun 2026)
- **In force from**: 2022-06-09
- **Category**: `bait_and_switch`
- **Severity**: `high`. Held misleading by CCPA when 'free' needs registration or payment.
- **Binding**: guideline (CCPA, binding under CPA 2019)
- **What a violation looks like in code**: Copy says 'Free', 'Rs 0', 'free trial' or 'free course' while code requires payment details, registration or a purchase to access, with no adjacent disclosure of the condition.
- **What compliance looks like in code**: Any condition (registration, card, later charge, minimum purchase) is stated next to the 'free' claim in the same view.
- **Not applicable when**: Platform makes no 'free' claims.

### ECOM-4.9: Purchase consent only by explicit affirmative action; no pre-ticked boxes

- **Rule**: Purchase consent only by explicit affirmative action; no pre-ticked boxes.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 4(9)
- **In force from**: 2020-07-23
- **Category**: `basket_sneaking`
- **Severity**: `critical`. Express rule text; cited in every 2026 dark-pattern penalty order.
- **Binding**: law
- **What a violation looks like in code**: Any checkbox, toggle or radio that records agreement to buy/add/pay (add-on, insurance, donation, auto-renew, T&C bundled with purchase) is pre-selected (checked, defaultChecked, value=true default, initial state true), or consent is inferred from scrolling/continuing.
- **What compliance looks like in code**: All purchase-related consent controls default to unselected/false and require a click; consent is stored only after that action.
- **Not applicable when**: Platform sells nothing (no checkout).

### ECOM-4.2-4.4: Entity identity, customer care and grievance officer shown on the platform

- **Rule**: Entity identity, customer care and grievance officer shown on the platform.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 4(2) and 4(4); Rule 6(5)(e) for sellers; DPDP Act s.6(3) contact person (data requests)
- **In force from**: 2020-07-23
- **Category**: `grievance_disclosure`
- **Severity**: `medium`. Without it users cannot complain or seek redress; no direct money loss.
- **Binding**: law
- **What a violation looks like in code**: No page/footer/component renders the legal entity name, HQ address, customer-care contacts, and the grievance officer's name, designation and contact (grep finds no 'Grievance Officer' copy).
- **What compliance looks like in code**: Footer or a linked 'Contact / Grievance Redressal' page renders legal name, address, customer-care email/phone, and grievance officer name, designation and contact; a data-protection contact is also listed.
- **Not applicable when**: Not an e-commerce entity (no buying or selling of goods or services).

### ECOM-TOTAL-PRICE: Total price in a single figure with a breakup of all charges

- **Rule**: Total price in a single figure with a breakup of all charges.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 6(5)(b) (marketplace sellers) and Rule 7(1)(e) (inventory entities); Rule 5(3)(e)
- **In force from**: 2020-07-23
- **Category**: `pricing_disclosure`
- **Severity**: `high`. Hidden composition of the price impairs informed purchase.
- **Binding**: law
- **What a violation looks like in code**: Order summary shows only a total, or only item prices, without line items for delivery, handling, convenience, platform fees and tax; breakup components do not sum to the total.
- **What compliance looks like in code**: Before payment the summary shows each compulsory and voluntary charge and tax, plus one total that equals their sum.
- **Not applicable when**: Platform takes no payments.

### ECOM-RETURNS: Return, refund, exchange, warranty, delivery and payment info shown pre-purchase

- **Rule**: Return, refund, exchange, warranty, delivery and payment info shown pre-purchase.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 5(3)(c), 6(5)(g)-(i), 7(1)(a); best-before date added by E-Commerce (Amendment) Rules, 2026 from 1 Jan 2027
- **In force from**: 2020-07-23
- **Category**: `product_disclosure`
- **Severity**: `medium`. Needed for informed decisions; indirect harm.
- **Binding**: law
- **What a violation looks like in code**: Product/checkout pages have no return/refund/exchange policy, delivery estimate, return-shipping cost or warranty info, and no link to such a policy; policy page missing from routes.
- **What compliance looks like in code**: Product page or checkout shows or links the return/refund/exchange, warranty, delivery and return-shipping-cost terms (and best-before date where relevant).
- **Not applicable when**: Platform sells only intangible services where returns do not apply and states so; still check refund terms.

### ECOM-PAY-CANCEL: Payment methods, fees and how to cancel regular payments disclosed

- **Rule**: Payment methods, fees and how to cancel regular payments disclosed.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 5(3)(d) and Rule 7(1)(c)
- **In force from**: 2020-07-23
- **Category**: `recurring_payments`
- **Severity**: `high`. Users must know how to stop recurring debits before agreeing.
- **Binding**: law
- **What a violation looks like in code**: Recurring/auto-pay checkout gives no text on fees for each payment method or on the procedure to cancel regular payments; no help/FAQ copy on stopping auto-debit.
- **What compliance looks like in code**: Checkout or a linked page lists payment methods, any method-specific fees, charge-back options, and step-by-step instructions to cancel regular payments.
- **Not applicable when**: Platform has no recurring payments and charges no payment-method fees.

### ECOM-SELLER-INFO: Seller details shown on marketplace listings

- **Rule**: Seller details shown on marketplace listings.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 5(3)(a); seller website/email added by 2026 Amendment from 1 Jan 2027
- **In force from**: 2020-07-23
- **Category**: `product_disclosure`
- **Severity**: `medium`. Identifies who is liable; indirect harm.
- **Binding**: law
- **What a violation looks like in code**: Marketplace product page renders no seller name, address, customer-care number or rating (seller field fetched but not displayed).
- **What compliance looks like in code**: Listing or a seller link shows business name, address, customer-care number, rating and (from 2027) website/email where available.
- **Not applicable when**: Inventory model (the platform is the only seller).

### ECOM-4.6-COO: Importer and country of origin shown for imported goods

- **Rule**: Importer and country of origin shown for imported goods.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 4(6) and 6(5)(d),(f); Rule 4(6)(b) as amended 2026 (from 1 Jan 2027)
- **In force from**: 2020-07-23
- **Category**: `product_disclosure`
- **Severity**: `medium`. Statutory disclosure; indirect harm.
- **Binding**: law
- **What a violation looks like in code**: Product schema has no country-of-origin/importer fields, or they exist but are not rendered on the product page for imported goods.
- **What compliance looks like in code**: Product page renders country of origin (full name) and importer name/details for imported goods.
- **Not applicable when**: Platform sells no physical goods, or only domestic goods.

### ECOM-4.11-DISCRIM: No price discrimination between consumers of the same class

- **Rule**: No price discrimination between consumers of the same class.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 4(11)(a)-(b); CCPA notices to Ola/Uber on device-based fares (Jan 2025)
- **In force from**: 2020-07-23
- **Category**: `pricing_disclosure`
- **Severity**: `high`. Charges some users more for the same thing based on arbitrary traits.
- **Binding**: law
- **What a violation looks like in code**: Pricing logic branches on device OS, user agent, battery level, app platform (iOS vs Android) or similar arbitrary attributes to change the fare/price for the same item, time and location.
- **What compliance looks like in code**: Price depends only on disclosed product/service factors (item, quantity, location, time, declared surge rules); no OS/device/user-agent inputs in price calculation.
- **Not applicable when**: Platform has fixed list prices with no per-user price computation.

### ECOM-RANKING: Ranking parameters disclosed; search not manipulated

- **Rule**: Ranking parameters disclosed; search not manipulated.
- **Source**: Consumer Protection (E-Commerce) Rules, 2020, Rule 5(3)(f) (descending order from 2027) and Rule 4(11)(c) inserted by 2026 Amendment (from 1 Jan 2027)
- **In force from**: 2020-07-23
- **Category**: `disguised_ads`
- **Severity**: `low`. Opaque ranking misleads indirectly; hard to prove harm.
- **Binding**: law
- **What a violation looks like in code**: No page explains the main ranking parameters; search code boosts own-brand or paying sellers without disclosure, or injects results unrelated to the query.
- **What compliance looks like in code**: A plain-language page lists the main ranking parameters in descending order of importance; search ranking code matches that description.
- **Not applicable when**: Platform has no search, listings or rankings of multiple goods or sellers.

### ECOM-4.12-SPONSORED: Sponsored listings distinctly and prominently labelled

- **Rule**: Sponsored listings distinctly and prominently labelled.
- **Source**: Consumer Protection (E-Commerce) (Amendment) Rules, 2026, new Rule 4(12) (notified 9 Sep 2026, in force 1 Jan 2027)
- **In force from**: 2027-01-01
- **Category**: `disguised_ads`
- **Severity**: `high`. Express new rule; paid placement passes as organic ranking.
- **Binding**: law
- **What a violation looks like in code**: Search/listing cards for promoted items render no 'Sponsored'/'Ad' badge, or the badge is tiny, low-contrast, or only in alt text/tooltip.
- **What compliance looks like in code**: Every sponsored card shows a visible 'Sponsored' label at readable size, rendered from the same flag that drives the paid boost.
- **Not applicable when**: Platform sells no paid placements.

### ECOM-4.13-PRIOR-PRICE: Discounts show the prior price (lowest in the previous 30 days)

- **Rule**: Discounts show the prior price (lowest in the previous 30 days).
- **Source**: Consumer Protection (E-Commerce) (Amendment) Rules, 2026, new Rule 4(13) (in force 1 Jan 2027)
- **In force from**: 2027-01-01
- **Category**: `pricing_disclosure`
- **Severity**: `high`. Fake reference prices inflate apparent savings.
- **Binding**: law
- **What a violation looks like in code**: Strike-through/MRP/'was' price or '% off' computed from a static compare-at/list field, not from a 30-day price history; no price-history store at all while discounts are shown.
- **What compliance looks like in code**: When a reduction is announced, the displayed prior price is the minimum price in the preceding 30 days from stored price history, shown next to the reduced price.
- **Not applicable when**: Platform never shows discounts or reduced prices.

### ECOM-4.15-CERT: Dark-pattern self-audit certificate displayed

- **Rule**: Dark-pattern self-audit certificate displayed.
- **Source**: Consumer Protection (E-Commerce) (Amendment) Rules, 2026, new Rule 4(15) (in force 1 Jan 2027); CCPA advisory of 5 Jun 2025
- **In force from**: 2027-01-01
- **Category**: `grievance_disclosure`
- **Severity**: `low`. Procedural transparency duty; no direct consumer loss.
- **Binding**: law
- **What a violation looks like in code**: No page, footer link or asset showing a dark-pattern self-audit certificate/declaration.
- **What compliance looks like in code**: Footer or compliance page prominently links a current yearly self-audit certificate.
- **Not applicable when**: Not an e-commerce entity.

### ECOM-5.7-BUNDLED-FEE: No bundled fees for unrelated services

- **Rule**: No bundled fees for unrelated services.
- **Source**: Consumer Protection (E-Commerce) (Amendment) Rules, 2026, new Rule 5(7) (in force 1 Jan 2027); exception for loyalty/membership programmes
- **In force from**: 2027-01-01
- **Category**: `basket_sneaking`
- **Severity**: `medium`. Charges for services the user did not ask for, but within a disclosed fee.
- **Binding**: law
- **What a violation looks like in code**: A single platform/convenience fee line whose definition or comments combine unrelated services (e.g. insurance, donation, third-party subscription) with platform service.
- **What compliance looks like in code**: Fees cover only platform services; unrelated services are separate, optional lines, or part of an opted-in loyalty/membership plan.
- **Not applicable when**: Not a marketplace e-commerce entity, or no platform fees.

### DPDP-5-NOTICE: Consent requests come with a clear, standalone notice

- **Rule**: Consent requests come with a clear, standalone notice.
- **Source**: Digital Personal Data Protection Act, 2023 s.5(1) and s.6(3); DPDP Rules, 2025 Rule 3 (in force 18 months after 14 Nov 2025)
- **In force from**: 2027-05-13
- **Category**: `data_consent`
- **Severity**: `medium`. Uninformed consent is invalid, but harm is indirect.
- **Binding**: law
- **What a violation looks like in code**: Data collection forms or consent prompts with no notice text, or a notice that only links a long privacy policy; notice lacks an itemised list of data, the purposes, how to withdraw, and how to complain to the Data Protection Board; no language option.
- **What compliance looks like in code**: Before or with the consent request, a standalone plain-language notice itemises data and purposes and links withdrawal, rights and complaint routes; English or an Eighth Schedule language can be selected.
- **Not applicable when**: Platform collects no personal data on consent (e.g. only legitimate-use processing).

### DPDP-6.1-AFFIRM: Data consent by clear affirmative action; no pre-ticked consent

- **Rule**: Data consent by clear affirmative action; no pre-ticked consent.
- **Source**: Digital Personal Data Protection Act, 2023 s.6(1)
- **In force from**: 2027-05-13
- **Category**: `data_consent`
- **Severity**: `high`. Personal data processed without valid consent.
- **Binding**: law
- **What a violation looks like in code**: Marketing, tracking, data-sharing or cookie consent toggles default to on (checked, defaultChecked, useState(true), consent=true default); consent assumed from use/scroll; 'Accept' only, no reject.
- **What compliance looks like in code**: Each consent defaults off and is recorded only after an affirmative click; a reject option sits alongside accept.
- **Not applicable when**: Platform collects no personal data by consent.

### DPDP-6.1-UNBUNDLED: Consent is specific, unbundled and not a condition for unnecessary data

- **Rule**: Consent is specific, unbundled and not a condition for unnecessary data.
- **Source**: Digital Personal Data Protection Act, 2023 s.6(1) (free, specific, unconditional; limited to necessary data) and its telemedicine illustration
- **In force from**: 2027-05-13
- **Category**: `forced_action`
- **Severity**: `high`. Forces users to give up data they need not share to get the service.
- **Binding**: law
- **What a violation looks like in code**: One checkbox/button covers service terms + marketing + third-party sharing; service blocked unless the user grants unrelated permissions (contacts, location, marketing) not needed for the feature.
- **What compliance looks like in code**: Separate consent per purpose; optional purposes can be refused while the core service still works; permissions are requested only when the feature needs them.
- **Not applicable when**: Platform collects no personal data by consent.

### DPDP-6.4-WITHDRAW: Withdrawing consent is as easy as giving it

- **Rule**: Withdrawing consent is as easy as giving it.
- **Source**: Digital Personal Data Protection Act, 2023 s.6(4); DPDP Rules, 2025 Rule 3(c)(i)
- **In force from**: 2027-05-13
- **Category**: `data_consent`
- **Severity**: `high`. Users cannot stop processing they agreed to.
- **Binding**: law
- **What a violation looks like in code**: Consent given with one click at sign-up but no settings toggle to withdraw; withdrawal only by email/support ticket; unsubscribe link missing in marketing templates.
- **What compliance looks like in code**: Privacy/consent settings expose a toggle per purpose; marketing messages include one-click unsubscribe; withdrawal takes no more steps than granting.
- **Not applicable when**: Platform collects no personal data by consent.

### DPDP-9-CHILDREN: Children: verifiable parental consent; no tracking or targeted ads

- **Rule**: Children: verifiable parental consent; no tracking or targeted ads.
- **Source**: Digital Personal Data Protection Act, 2023 s.9(1) and 9(3); DPDP Rules, 2025 Rule 10
- **In force from**: 2027-05-13
- **Category**: `data_consent`
- **Severity**: `high`. Statutory protection for minors; high penalty exposure.
- **Binding**: law
- **What a violation looks like in code**: Service aimed at or used by under-18s (ed-tech, games) with no age gate or parental-consent flow; analytics/ad SDKs and behavioural targeting active for users flagged or likely to be children.
- **What compliance looks like in code**: Age declaration plus a verifiable parental-consent step before processing child data; ad targeting and behavioural tracking disabled for child accounts.
- **Not applicable when**: Platform is clearly not directed at children and blocks under-18 sign-ups.

### RBI-EMANDATE-1: Recurring payments set up only through a disclosed, authenticated mandate

- **Rule**: Recurring payments set up only through a disclosed, authenticated mandate.
- **Source**: RBI Digital Payments - E-mandate Framework, 2026 (21 Apr 2026), paras 4(a)-(c), 5(a), 8 (issuer/acquirer duties; acquirers must ensure merchant compliance, para 10(c))
- **In force from**: 2026-04-21
- **Category**: `recurring_payments`
- **Severity**: `critical`. Money taken on a recurring basis without informed authorisation.
- **Binding**: law
- **What a violation looks like in code**: Card/UPI is stored and charged on a schedule by the merchant's own cron/job without registering an e-mandate via the payment gateway's mandate/subscription API; mandate screen omits amount (or max amount), frequency and validity; first charge processed outside the AFA flow.
- **What compliance looks like in code**: Recurring charges use the gateway's e-mandate/subscription API (with AFA at registration and first debit); checkout shows amount or cap, frequency, start date and validity before the user authorises.
- **Not applicable when**: Platform takes no recurring or auto-debit payments.

### RBI-EMANDATE-2: Users can see and withdraw a mandate; renewal is notified

- **Rule**: Users can see and withdraw a mandate; renewal is notified.
- **Source**: RBI Digital Payments - E-mandate Framework, 2026 (21 Apr 2026), paras 4(b) (withdraw at any time, communicated at registration), 6 (24-hour pre-debit notification and opt-out)
- **In force from**: 2026-04-21
- **Category**: `recurring_payments`
- **Severity**: `high`. Users cannot stop or anticipate recurring debits.
- **Binding**: law
- **What a violation looks like in code**: No in-app view of active auto-pay with a cancel/revoke action; registration screen does not say the mandate can be withdrawn; merchant-side code suppresses or replaces gateway pre-debit notifications or schedules charges with no advance notice.
- **What compliance looks like in code**: Account page lists active mandates with a working revoke/cancel call to the gateway; registration copy explains withdrawal; renewal reminders are sent ahead of each debit.
- **Not applicable when**: Platform takes no recurring or auto-debit payments.

### MVAG-TIP: Tips only after the service; no pay-more prompts during booking

- **Rule**: Tips only after the service; no pay-more prompts during booking.
- **Source**: Motor Vehicle Aggregator Guidelines, 2025 (tipping only after ride, as cited by CCPA); CCPA Rapido order (PIB, 15 Sep 2026)
- **In force from**: 2025-07-01
- **Category**: `confirm_shaming`
- **Severity**: `high`. Penalised ₹10 lakh; pressures extra payment when the user is committed.
- **Binding**: guideline (MoRTH under Motor Vehicles Act; applied by CCPA under CPA 2019)
- **What a violation looks like in code**: Tip/'add +₹10' prompts shown at booking or while searching for a driver; copy implying higher payment means faster pickup without data; price sliders coloured to push upward.
- **What compliance looks like in code**: Tip option appears only after the ride/service ends, is optional, with neutral copy and no default amount.
- **Not applicable when**: Not a ride-hailing, delivery or other service platform with tipping.

### ASCI-DD-1: Advertised and listed prices include non-optional fees

- **Rule**: Advertised and listed prices include non-optional fees.
- **Source**: ASCI Guidelines for Online Deceptive Design Patterns in Advertising (15 Jun 2023, applicable from 1 Sep 2023), Guideline 1 (Drip Pricing)
- **In force from**: 2023-09-01
- **Category**: `drip_pricing`
- **Severity**: `medium`. Self-regulatory restatement of drip pricing at the ad/listing level.
- **Binding**: self-regulatory (ASCI)
- **What a violation looks like in code**: Listing cards, banners or ad creatives show a base price while taxes or fees paid by all or most buyers are added later.
- **What compliance looks like in code**: Listing/ad price includes taxes and fees that apply to all or most buyers.
- **Not applicable when**: Platform shows no prices in listings or ads.

### ASCI-DD-2: Ad symbols keep their usual meaning (X closes)

- **Rule**: Ad symbols keep their usual meaning (X closes).
- **Source**: ASCI Guidelines for Online Deceptive Design Patterns in Advertising (15 Jun 2023, applicable from 1 Sep 2023), Guideline 2 (Bait and Switch), example (c)
- **In force from**: 2023-09-01
- **Category**: `interface_interference`
- **Severity**: `medium`. Misleading controls in ads trigger unwanted actions.
- **Binding**: self-regulatory (ASCI)
- **What a violation looks like in code**: Ad or promo overlay where the X/close element's handler opens the advertiser, installs or navigates instead of dismissing.
- **What compliance looks like in code**: Close controls in ads only dismiss the ad.
- **Not applicable when**: Platform shows no ads or promotional overlays.

### ASCI-DD-3: Influencer, paid-review and editorial-style ads are labelled

- **Rule**: Influencer, paid-review and editorial-style ads are labelled.
- **Source**: ASCI Guidelines for Online Deceptive Design Patterns in Advertising (15 Jun 2023, applicable from 1 Sep 2023), Guideline 4 (Disguised Ads; numbered DD-3 here because ASCI Guideline 3 is folded into CCPA-DP-01); ASCI influencer advertising guidelines
- **In force from**: 2023-09-01
- **Category**: `disguised_ads`
- **Severity**: `medium`. Self-regulatory; overlaps CCPA-DP-09.
- **Binding**: self-regulatory (ASCI)
- **What a violation looks like in code**: Influencer posts, paid reviews or advertorial blocks rendered without an 'Ad'/'Sponsored'/'Paid partnership' label.
- **What compliance looks like in code**: Such content shows an upfront, prominent disclosure label.
- **Not applicable when**: No influencer, paid-review or advertorial content.

### LM-6.10: Mandatory packaged-commodity declarations shown on product pages

- **Rule**: Mandatory packaged-commodity declarations shown on product pages.
- **Source**: Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(10) (inserted 2017, effective 1 Jan 2018) read with Rule 6(1)
- **In force from**: 2018-01-01
- **Category**: `product_disclosure`
- **Severity**: `medium`. Statutory labelling; supports price comparison, indirect harm.
- **Binding**: law
- **What a violation looks like in code**: Product page/schema for pre-packaged goods lacks or does not render MRP (inclusive of taxes), net quantity, unit sale price, manufacturer/packer/importer name and address, country of origin, consumer-care details, or generic name.
- **What compliance looks like in code**: Product page renders all Rule 6(1) declarations (MRP, net quantity, unit sale price, maker/packer/importer, country of origin, consumer care, generic name); manufacturing date/best-before shown where applicable.
- **Not applicable when**: Platform sells no pre-packaged goods (services, digital goods only).

### LM-6.10A: Searchable, sortable country-of-origin filter for imported goods

- **Rule**: Searchable, sortable country-of-origin filter for imported goods.
- **Source**: Legal Metrology (Packaged Commodities) Amendment Rules, 2026, G.S.R. 128(E) of 13 Feb 2026, new Rule 6(10A) (reported in force 1 Jul 2026)
- **In force from**: 2026-07-01
- **Category**: `product_disclosure`
- **Severity**: `low`. Navigation aid; disclosure itself is covered by LM-6.10.
- **Binding**: law
- **What a violation looks like in code**: Catalogue search/filter code offers no country-of-origin facet or sort although imported packaged goods are sold.
- **What compliance looks like in code**: Search UI exposes a country-of-origin filter and sort backed by the product's origin field.
- **Not applicable when**: No imported pre-packaged goods sold.

## Scoring

**Weights**: critical 4, high 3, medium 2, low 1.

**Per-rule status**: `pass`, `fail`, `not_applicable`, `unknown`.

**Compliance %** over applicable, decided rules:

```
score = 100 * sum(w[r] for r in rules if status[r] == "pass")
            / sum(w[r] for r in rules if status[r] in ("pass", "fail"))
```

- **Not applicable** rules leave both numerator and denominator. Each N/A needs a cited reason (e.g. "no subscription or recurring-billing code found; searched for `subscription|renew|mandate|autopay`"). If the agent cannot show the feature is absent, the rule is `unknown`, not N/A.
- **Unknown** rules are also left out of the score but are reported as **coverage** = decided weight / applicable weight. Show the score next to its coverage (e.g. "72% compliant, 85% coverage"), so missing backend code cannot inflate the score unnoticed.
- **Not yet in force** (`effectiveFrom` later than the audit date): keep them out of the headline score and show a separate "readiness" score over them. Turn on a single toggle (`includeUpcoming`) to fold them in once the date passes. As of 25 Oct 2026 this covers ECOM-4.12, 4.13, 4.15, 5.7 (from 1 Jan 2027) and the DPDP rules (May 2027). DPDP still matters for consent design today because CCPA applies E-Commerce Rule 4(9) to consent now.
- **Binding level**: the headline score counts `law` and `guideline` rules. `self-regulatory` (ASCI) rules are scored too but are also shown as their own sub-score, so a reader can see the legally binding figure on its own.
- **Critical cap (suggested)**: if any critical rule fails, cap the headline at 59% and flag it, because one critical failure (money taken without consent, a cancellation trap) is enough for CCPA action whatever the rest of the score.
- **Per-category view**: also group results by `category` (the 13 taxonomy ids plus `data_consent`, `pricing_disclosure`, `recurring_payments`, `grievance_disclosure`, `product_disclosure`; ad labelling rules map to `disguised_ads`), matching the Riptide taxonomy.

Example: 30 applicable decided rules worth 80 weight in total, of which failures weigh 18 (one critical, three high, two medium, one low) gives 100 × 62/80 = 77.5%. Because a critical rule failed, the headline is capped at 59%.
