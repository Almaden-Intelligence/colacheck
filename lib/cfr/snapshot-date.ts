/**
 * The eCFR issue date the regulation corpus in lib/cfr/ is pinned to.
 *
 * THIS IS THE ONLY PLACE THIS DATE SHOULD BE EDITED BY HAND.
 *
 * When the corpus is re-pulled after an eCFR change notification:
 *   1. Regenerate the markdown with scripts/ecfr_to_md.py using the new date.
 *   2. Update CFR_SNAPSHOT_DATE below to match.
 *   3. Update the scope table in lib/cfr/SNAPSHOT.md.
 *
 * If step 2 is missed, lib/cfr/load.ts throws on the next check rather than
 * letting the app claim a currency it does not have. A stale date shown
 * confidently is worse than a check that refuses to run.
 *
 * Must be an eCFR issue date in YYYY-MM-DD form — a date eCFR has actually
 * published. Requesting a date eCFR has not issued returns an error naming
 * the most recent valid one.
 */
export const CFR_SNAPSHOT_DATE = '2026-09-02'

/**
 * The same date for display, e.g. on the homepage. Kept alongside the machine
 * form so the two cannot drift apart.
 */
export const CFR_SNAPSHOT_DISPLAY = 'September 2, 2026'
