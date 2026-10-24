# Dark-pattern taxonomy

Source: Central Consumer Protection Authority (CCPA), *Guidelines for Prevention and Regulation of Dark Patterns, 2023* (notified 30 Nov 2023), which lists 13 dark patterns treated as unfair trade practices. Enforcement example: PIB release of 3 Jun 2026, "CCPA Acts Against Dark Patterns on Digital Platforms" (https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268302).

Machine ids are in `engine/contracts/index.ts` (`CCPA_CATEGORIES`). Definitions below are paraphrased.

| id | Name | What it is | Typical sandbox form |
|---|---|---|---|
| `false_urgency` | False Urgency | Falsely stating or implying urgency or scarcity to rush a purchase. | Countdown that resets, "only 2 left" with no basis, "12 people viewing". |
| `basket_sneaking` | Basket Sneaking | Adding items, services, donations or charges at checkout without the user's consent, so the total exceeds what they chose. | Pre-ticked add-on, donation or insurance; item auto-added to cart. |
| `confirm_shaming` | Confirm Shaming | Using phrasing, images or audio to create fear, shame, ridicule or guilt to push a choice. | Decline button "No, I don't care about my family's safety"; "Accept risk". |
| `forced_action` | Forced Action | Forcing an action to get what the user wanted: buying something extra, sharing personal data, or signing up for an unrelated service. | "Free" item that needs a phone number; must join membership to continue. |
| `subscription_trap` | Subscription Trap | Making cancellation hard or hidden, forcing payment details for a free plan, or giving unclear cancellation steps. | Cancel buried behind retention offers; extra confirm steps; misleading final button. |
| `interface_interference` | Interface Interference | Design that highlights some information and obscures other relevant information to misdirect. | Accept is a big primary button, decline is a tiny grey link; fee in low-contrast fine print. |
| `bait_and_switch` | Bait and Switch | Advertising one outcome and delivering another. | Advertised price/variant swapped for a dearer one at cart. |
| `drip_pricing` | Drip Pricing | Hiding parts of the price up front and revealing them later, or advertising "free" and charging later. | Fee appears only at review/payment; total rises between steps. |
| `disguised_ads` | Disguised Advertisement | Advertising presented as other content (reviews, recommendations, editorial). | "Top pick" that is a paid placement with no "Sponsored" label. |
| `nagging` | Nagging | Repeated requests or interruptions unrelated to the user's intended task. | Upsell modal on every step; repeated notification prompts. |
| `trick_question` | Trick Question | Confusing or ambiguous wording (e.g. double negatives) to steer an answer. | "Uncheck to not stop receiving offers". |
| `saas_billing` | SaaS Billing | Collecting recurring payments by exploiting positive acquisition loops, e.g. free trials that silently convert, charging without notice. | Trial converts to annual prepaid; renewal date or price hidden. |
| `rogue_malware` | Rogue Malware | Ransomware or scareware that misleads users into thinking they have a virus to sell a fake fix. | **UI simulation only**: a fake "device at risk" alert selling protection. Never real code on the visitor's device. |

## Worked examples (PIB, 3 Jun 2026)
- PhysicsWallah: ₹10 donation pre-selected at checkout → **basket sneaking**; emotional copy to keep it → **confirm shaming**; "free" courses gated on phone/email → **forced action**. Consent cannot be assumed through pre-selected options.
- McAfee: renewal choice framed as "Renew Now" vs "Accept Risk" → **confirm shaming**, **interface interference** (renew more prominent), **trick question**, **forced action** (no neutral opt-out).

## Experimental (agent-targeted) categories
- `exp_dom_visual_mismatch`: what the DOM/accessibility tree says differs from what is drawn (e.g. a visually unticked box that is checked).
- `exp_misleading_a11y_label`: `aria-label`/`alt` text that misdescribes the control.
- `exp_prompt_injection`: text addressed to AI agents. Separate scoring track; never mixed into the headline rating.
