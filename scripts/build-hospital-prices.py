#!/usr/bin/env python3
"""Build data/hospital-prices.json (and the internal min/max companion file)
from the BillShield data-feasibility-spike CSVs.

Usage:
    python scripts/build-hospital-prices.py [--spike-dir PATH]

Input: the spike's hospitals/*_aggregate.csv, hospitals/manifest.csv, and
hospitals/hospital_list.csv (see data/README.md for what each column means
and why negotiated min/max is excluded from the public file).
"""
import argparse
import csv
import datetime
import json
import pathlib

HOSPITALS = [
    # (aggregate_csv_stem, id, name, system, city, status, unavailable_reason)
    ("cc_indian_river", "cc-indian-river", "Cleveland Clinic Indian River Hospital",
     "Cleveland Clinic Florida", "Vero Beach", "available", None),
    ("cc_tradition", "cc-tradition", "Cleveland Clinic Martin Health Tradition Hospital",
     "Cleveland Clinic Florida (Martin Health)", "Port St. Lucie", "available", None),
    ("hca_lawnwood", "hca-lawnwood", "HCA Florida Lawnwood Hospital",
     "HCA Florida Healthcare", "Fort Pierce", "available", None),
    ("hca_stlucie", "hca-stlucie", "HCA Florida St. Lucie Hospital",
     "HCA Florida Healthcare", "Port St. Lucie", "available", None),
    ("hca_raulerson", "hca-raulerson", "HCA Florida Raulerson Hospital",
     "HCA Florida Healthcare", "Okeechobee", "available", None),
    ("hf_holmes_regional", "hf-holmes-regional", "Health First Holmes Regional Medical Center",
     "Health First", "Melbourne", "available", None),
    ("hf_palm_bay", "hf-palm-bay", "Health First Palm Bay Hospital",
     "Health First", "Palm Bay", "available", None),
    ("hf_viera", "hf-viera", "Health First Viera Hospital",
     "Health First", "Viera/Melbourne", "available", None),
    (None, "sebastian-river", "Sebastian River Medical Center (Orlando Health Sebastian River Hospital)",
     "Orlando Health", "Sebastian", "not_available",
     "orlandohealth.com blocked every automated request with an anti-bot checkpoint (HTTP 429); no price file could be retrieved."),
    (None, "rockledge-regional", "Rockledge Regional Medical Center",
     "Orlando Health", "Rockledge", "not_available",
     "Facility permanently closed 2025-04-23; no current price file exists."),
]

MANIFEST_URL_BY_NAME = {}


def load_manifest(spike_dir):
    path = spike_dir / "hospitals" / "manifest.csv"
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["hospital"].strip()
            if not name:
                continue
            ts = int(row["fetched_at_unix"])
            date = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).date().isoformat()
            MANIFEST_URL_BY_NAME[name] = (row["url"], date)


def to_number(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def load_aggregate(spike_dir, stem):
    path = spike_dir / "hospitals" / f"{stem}_aggregate.csv"
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--spike-dir", default=str(pathlib.Path.home() / "billshield-data-spike"))
    parser.add_argument("--out", default=str(pathlib.Path(__file__).resolve().parent.parent / "data" / "hospital-prices.json"))
    parser.add_argument("--out-internal", default=str(pathlib.Path(__file__).resolve().parent.parent / "data" / "hospital-prices.internal.json"))
    args = parser.parse_args()

    spike_dir = pathlib.Path(args.spike_dir)
    load_manifest(spike_dir)

    today = datetime.date.today().isoformat()

    public_hospitals = []
    internal_hospitals = []

    for stem, hid, name, system, city, status, reason in HOSPITALS:
        entry = {
            "id": hid,
            "name": name,
            "system": system,
            "city": city,
            "state": "FL",
            "status": status,
        }
        internal_entry = dict(entry)

        if status == "not_available":
            entry["unavailable_reason"] = reason
            internal_entry["unavailable_reason"] = reason
            entry["lines"] = []
            internal_entry["lines"] = []
            public_hospitals.append(entry)
            internal_hospitals.append(internal_entry)
            continue

        url, retrieval_date = MANIFEST_URL_BY_NAME.get(name, (None, None))
        entry["source_file_url"] = url
        entry["retrieval_date"] = retrieval_date
        entry["extraction_date"] = retrieval_date or today
        internal_entry["source_file_url"] = url
        internal_entry["retrieval_date"] = retrieval_date
        internal_entry["extraction_date"] = retrieval_date or today

        public_lines = []
        internal_lines = []
        for row in load_aggregate(spike_dir, stem):
            gross = to_number(row.get("gross_charge"))
            cash = to_number(row.get("discounted_cash_price"))
            neg_min = to_number(row.get("negotiated_min"))
            neg_max = to_number(row.get("negotiated_max"))
            code = row["code"]
            desc = row["description"]

            if gross is not None and cash is not None and gross > 0 and cash > 0:
                public_lines.append({
                    "code": code,
                    "description": desc,
                    "gross_charge": gross,
                    "discounted_cash_price": cash,
                })

            internal_lines.append({
                "code": code,
                "description": desc,
                "gross_charge": gross,
                "discounted_cash_price": cash,
                "negotiated_min": neg_min,
                "negotiated_max": neg_max,
            })

        entry["lines"] = public_lines
        internal_entry["lines"] = internal_lines
        public_hospitals.append(entry)
        internal_hospitals.append(internal_entry)

    public_doc = {
        "generated": today,
        "note": "gross_charge and discounted_cash_price are each hospital's own federally-required price-transparency disclosure, as published in their machine-readable file on the listed retrieval date. These are not what every patient pays — see data/README.md.",
        "hospitals": public_hospitals,
    }
    internal_doc = {
        "generated": today,
        "note": "INTERNAL ONLY. Includes negotiated_min/negotiated_max, which aggregate dozens of distinct payer/plan contracted rates per code. Do not expose this range to end users or in any letter — see data/README.md for why.",
        "hospitals": internal_hospitals,
    }

    out_path = pathlib.Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(public_doc, indent=2) + "\n", encoding="utf-8")

    out_internal_path = pathlib.Path(args.out_internal)
    out_internal_path.write_text(json.dumps(internal_doc, indent=2) + "\n", encoding="utf-8")

    n_lines = sum(len(h["lines"]) for h in public_hospitals)
    n_available = sum(1 for h in public_hospitals if h["status"] == "available")
    print(f"Wrote {out_path} — {n_available} available hospitals, {n_lines} priced code lines total.")
    print(f"Wrote {out_internal_path} (internal, includes negotiated min/max).")


if __name__ == "__main__":
    main()
