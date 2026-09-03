CFR Corpus — Provenance and Scope
This directory holds the text of the federal regulations COLACheck checks against.
It is the authority for the compliance engine. The prompts reference this text
rather than restating it.
Source
All text is retrieved from the Electronic Code of Federal Regulations (eCFR) at
ecfr.gov, published by the Office of the Federal Register and the Government
Publishing Office. The eCFR is authoritative but unofficial; the official
annual publication is the printed CFR on govinfo.gov.
Text is never taken from PDFs, screenshots, or secondary sources.
Files
File	Part	Scope	Retrieved	eCFR "up to date as of"
`part-16-health-warning.md`	27 CFR Part 16	Complete (§§ 16.1–16.33)	2026-09-03	9/01/2026
`part-04-wine.md`	27 CFR Part 4	pending	—	—
`part-05-spirits.md`	27 CFR Part 5	pending	—	—
`part-07-malt.md`	27 CFR Part 7	pending	—	—
Title 27 was last amended 8/17/2026 as of the first retrieval.
Scope policy
Included: the subparts that govern what must, may, and may not appear on a
container label — mandatory information, label standards (legibility, type
size, language, affixing), restricted and prohibited statements, and standards
of identity used for class and type designations.
Excluded: advertising rules, COLA application procedure, formulas,
penalties, and administrative provisions. COLACheck screens labels, not
advertisements or filings. Excluded material adds cost to every check and
dilutes the signal the engine needs.
Part 16 is included in full because it is short and every section bears on
label content.
If a check ever needs an excluded subpart, add that subpart here and record it
in the table above rather than working from memory.
What to do when a regulation changes
An email arrives from eCFR. Subscriptions are active for Parts 4, 5, 7 and
16 (Title 27 :: Chapter I :: Subchapter A), started 2026-09-03, managed at
ecfr.gov under My eCFR → My Subscriptions. Note these only watch forward
from that date.
Re-retrieve the affected part from the URL recorded in the file header.
Replace the file and commit. `git diff` shows exactly which sentences moved.
Review the diff against the corresponding prompt in `lib/`. Any check citing
a changed section needs revisiting.
Update the retrieval date and "up to date as of" date in the table above.
Known history worth remembering
Parts 5 and 7 were comprehensively restructured and renumbered by
T.D. TTB-176, 87 FR 7579, Feb. 9, 2022. Section numbers from before that
date do not map onto the current text — some were renumbered, others no longer
exist. Any citation to Part 5 or Part 7 that predates February 2022 should be
treated as suspect until verified against this corpus.
