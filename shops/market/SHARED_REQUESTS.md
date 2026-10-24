# Shared requests from market

1. **PaymentPage `onPaid` hook (nice to have).** Cartwheel starts a Plus membership when an order containing the `plus` line is paid. Today it infers this from `session.lastOrder` on the account pages. A callback such as `<PaymentPage onPaid={(order) => …} />` would make this explicit. Workaround in place: `useMembership()` in `components/hooks.ts`.
2. **`InterstitialPage` skip button uses `data-variant="primary"`** for both continue and skip. Fine for equal weight, but a `secondary` default for both might read better. No change needed for market.
