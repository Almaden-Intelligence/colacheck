#!/usr/bin/env python3
"""
Convert an eCFR full-text XML export into clean markdown for lib/cfr/.

Usage:
    python3 ecfr_to_md.py <input.xml> <output.md> <date> <subpart> [subpart ...]

Source XML comes from:
    https://www.ecfr.gov/api/versioner/v1/full/<DATE>/title-27.xml?part=<N>
"""
import sys
import re
import xml.etree.ElementTree as ET


def text_of(el):
    """Flatten an element to plain text, italicising <I> runs."""
    out = []
    if el.text:
        out.append(el.text)
    for child in el:
        inner = text_of(child)
        if child.tag == "I" and inner.strip():
            out.append(f"*{inner.strip()}*")
        elif child.tag in ("SU",):
            out.append(inner)
        else:
            out.append(inner)
        if child.tail:
            out.append(child.tail)
    return "".join(out)


def clean(s):
    s = s.replace("\u2014", "—").replace("\u2019", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s+\n", "\n", s)
    return s.strip()


def render_section(sec, lines):
    head = clean(sec.findtext("HEAD") or "")
    if head:
        lines.append(f"### {head}\n")
    for el in sec:
        if el.tag in ("HEAD",):
            continue
        if el.tag in ("P", "FP", "PSPACE"):
            body = clean(text_of(el))
            if body:
                lines.append(body + "\n")
        elif el.tag == "CITA":
            body = clean(text_of(el))
            if body:
                lines.append(f"*{body}*\n")
        elif el.tag == "EDNOTE":
            body = clean(text_of(el))
            if body:
                lines.append(f"> {body}\n")
        elif el.tag == "GPOTABLE":
            rows = []
            for row in el.iter("ROW"):
                cells = [clean(text_of(c)) for c in row.findall("ENT")]
                if any(cells):
                    rows.append(cells)
            if rows:
                width = max(len(r) for r in rows)
                rows = [r + [""] * (width - len(r)) for r in rows]
                lines.append("| " + " | ".join(rows[0]) + " |")
                lines.append("| " + " | ".join(["---"] * width) + " |")
                for r in rows[1:]:
                    lines.append("| " + " | ".join(r) + " |")
                lines.append("")


def main():
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)

    src, dst, date = sys.argv[1], sys.argv[2], sys.argv[3]
    wanted = set(sys.argv[4:])

    root = ET.parse(src).getroot()
    part_num = root.get("N")
    part_head = clean(root.findtext("HEAD") or "")
    authority = clean(root.findtext("AUTH/PSPACE") or "")
    source = clean(root.findtext("SOURCE/PSPACE") or "")

    lines = []
    lines.append(f"# 27 CFR Part {part_num} — " + part_head.split("—")[-1].strip().capitalize() + "\n")
    lines.append(
        f"> Source: eCFR, https://www.ecfr.gov/api/versioner/v1/full/{date}"
        f"/title-27.xml?part={part_num}"
    )
    lines.append(f"> Snapshot date: {date} (pinned; reproducible from the URL above)")
    lines.append(f"> Subparts included: {', '.join(sorted(wanted))}\n")
    if authority:
        lines.append(f"**Authority:** {authority}\n")
    if source:
        lines.append(f"**Source:** {source}\n")
    lines.append("---\n")

    kept = []
    for sp in root.iter("DIV6"):
        if sp.get("N") not in wanted:
            continue
        sp_head = clean(sp.findtext("HEAD") or "")
        lines.append(f"## {sp_head}\n")
        secs = list(sp.iter("DIV8"))
        kept.extend(s.get("N") for s in secs)
        for sec in secs:
            render_section(sec, lines)
            lines.append("")

    out = "\n".join(lines)
    out = re.sub(r"\n{3,}", "\n\n", out)
    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(out)

    print(f"wrote {dst}  ({len(out):,} chars, {len(kept)} sections)")
    print("sections:", " ".join(kept))


if __name__ == "__main__":
    main()
