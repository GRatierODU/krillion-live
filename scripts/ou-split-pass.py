#!/usr/bin/env python3
"""Split remaining clear A-or-B OU prompts. No geo audit, no list expansion."""

from __future__ import annotations

import json
import pathlib
import sys
from importlib.machinery import SourceFileLoader

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
qa = SourceFileLoader(
    "catalog_qa",
    str(pathlib.Path(__file__).resolve().parent / "apply-catalog-qa.py"),
).load_module()

GEO = "géographie"
CUISINE = "cuisine"
HIST = "histoire"


def take_named(answers: list, names: list[str]) -> list:
    by = {row[0].casefold(): row for row in answers}
    out = []
    for name in names:
        row = by.get(name.casefold())
        if row:
            out.append(row)
    return out


def main() -> None:
    bank = json.loads(qa.BANK.read_text(encoding="utf-8"))
    extra_by = {row[0]: row for row in qa.load_extra()}
    splits: list[str] = []

    def find(pid: str) -> list:
        return qa.find(bank, pid)

    def tombstone(pid: str, category: str) -> None:
        bank[:] = [row for row in bank if row[0] != pid]
        extra_by[pid] = [pid, category, "", []]
        splits.append(f"tombstone:{pid}")

    def add(pid: str, category: str, prompt: str, answers: list) -> None:
        if any(row[0] == pid for row in bank):
            qa.replace(bank, pid, category, prompt, answers)
        else:
            bank.append([pid, category, prompt, answers])
        extra_by[pid] = next(row for row in bank if row[0] == pid)
        splits.append(f"new:{pid}:{len(answers)}")

    # 1) fleuve ou rivière
    hydro = list(find("fleuve-fr")[3])
    fleuves = take_named(
        hydro,
        [
            "Seine", "Loire", "Rhône", "Garonne", "Rhin", "Meuse", "Somme",
            "Vilaine", "Adour", "Charente", "Dordogne", "Escaut", "Var",
            "Hérault", "Authie", "Canche", "Orne", "Touques", "Blavet",
            "Aulne", "Vendée", "Lay", "Argens", "Orb", "Aude", "Têt", "Tech",
            "Vidourle", "Couesnon", "Rance", "Odet", "Vire", "Aa", "Bidassoa",
            "Sélune", "Trieux",
        ],
    )
    rivieres = take_named(
        hydro,
        [
            "Marne", "Oise", "Yonne", "Aube", "Allier", "Cher", "Vienne",
            "Creuse", "Sarthe", "Mayenne", "Saône", "Isère", "Durance", "Ain",
            "Lot", "Tarn", "Aveyron", "Ariège", "Ill", "Moselle", "Gave de Pau",
            "Sèvre", "Doubs", "Ardèche", "Gard", "Cèze", "Gave d'Oloron",
            "Nive", "Sèvre Nantaise", "Sèvre Niortaise", "Erdre", "Lys",
            "Deûle", "Eure", "Loir", "Indre", "Drôme", "Roubion", "Lez",
            "Hers", "Salat", "Scorff", "Oust", "Chiers", "Sauer", "Thur",
        ],
    )
    tombstone("fleuve-fr", GEO)
    add("fleuve-france", GEO, "Nomme un fleuve de France", fleuves)
    add("riviere-france", GEO, "Nomme une rivière de France", rivieres)

    # 2) nouilles ou pâtes
    plats = list(find("nouilles")[3])
    nouilles = take_named(
        plats,
        [
            "Ramen", "Pad thaï", "Pho", "Udon", "Soba", "Banh canh", "Japchae",
            "Laksa", "Yakisoba", "Chow mein", "Lo mein", "Dan dan",
            "Zhajiangmian", "Jajangmyeon", "Bibim guksu", "Khao soi",
            "Mee goreng", "Hokkien mee", "Char kway teow",
        ],
    )
    pates = take_named(
        plats,
        [
            "Spaghetti", "Carbonara", "Lasagnes", "Ravioli", "Tagliatelles",
            "Penne", "Couscous", "Cacio e pepe", "Amatriciana", "Bolognese",
            "Pesto", "Macaroni", "Fettuccine Alfredo", "Linguine", "Bucatini",
            "Orecchiette", "Gnocchi", "Tortellini", "Cannelloni",
        ],
    )
    tombstone("nouilles", CUISINE)
    add("plat-nouilles", CUISINE, "Nomme un plat à base de nouilles", nouilles)
    add("plat-pates", CUISINE, "Nomme un plat à base de pâtes", pates)

    # 3) aliment ou boisson fermenté
    ferm = list(find("fermente")[3])
    aliments = take_named(
        ferm,
        [
            "Pain", "Yaourt", "Fromage", "Choucroute", "Kimchi", "Miso",
            "Sauce soja", "Tempeh", "Natto", "Pickles", "Cornichons", "Olives",
            "Vinaigre", "Skyr", "Crème fraîche", "Beurre", "Salami", "Chorizo",
            "Idli", "Dosa", "Injera", "Garum", "Nuoc-mâm", "Surströmming",
            "Hákarl",
        ],
    )
    boissons = take_named(
        ferm,
        [
            "Vin", "Bière", "Cidre", "Kéfir", "Kombucha", "Kvass", "Lassi",
            "Saké", "Champagne", "Kéfir d'eau", "Pulque", "Tepache",
        ],
    )
    tombstone("fermente", CUISINE)
    add("aliment-fermente", CUISINE, "Nomme un aliment fermenté", aliments)
    add("boisson-fermentee", CUISINE, "Nomme une boisson fermentée", boissons)

    # 4) cité antique ou site archéo
    sites = list(find("cite-perdue")[3])
    cites = take_named(
        sites,
        [
            "Pompéi", "Machu Picchu", "Pétra", "Angkor", "Troie", "Cnosse",
            "Mycènes", "Persépolis", "Babylone", "Our", "Ninive", "Palmyre",
            "Teotihuacan", "Tikal", "Chichén Itzá", "Monte Albán", "Tiwanaku",
            "Great Zimbabwe", "Leptis Magna", "Éphèse", "Pergame", "Delphes",
            "Olympie", "Carthage", "Dougga", "Volubilis", "Leptis", "Cyrène",
            "Bagan", "Ayutthaya", "Sukhothaï", "Mohenjo-daro", "Harappa",
            "Taxila", "Anuradhapura", "Herculanum", "Ostie", "Petra", "Uruk",
            "Nippur", "Hattousa", "Tell el-Amarna", "Méroé", "Aksum", "Copán",
            "Palenque", "Uxmal", "Calakmul", "Caral", "Chan Chan", "Timgad",
            "Djemila", "Sabratha", "Apollonia",
        ],
    )
    archeo = take_named(
        sites,
        [
            "Pompéi", "Machu Picchu", "Pétra", "Angkor", "Nazca", "Angkor Wat",
            "Stonehenge", "Newgrange", "Skara Brae", "Çatal Höyük",
            "Göbekli Tepe", "Borobudur", "Prambanan", "Louxor", "Karnak",
            "Abou Simbel", "Gizeh", "Saqqarah", "Moaï", "Nan Madol",
            "Mesa Verde", "Cahokia", "Herculanum", "Teotihuacan", "Tikal",
            "Chichén Itzá", "Éphèse", "Delphes", "Olympie", "Carthage",
            "Timgad",
        ],
    )
    tombstone("cite-perdue", GEO)
    add("cite-antique", GEO, "Nomme une cité antique", cites)
    add("site-archeo", GEO, "Nomme un site archéologique majeur", archeo)

    # 5) bataille ou lieu (Grande Guerre)
    ww1 = list(find("guerre-14")[3])
    batailles = take_named(
        ww1,
        [
            "Verdun", "La Marne", "La Somme", "Chemin des Dames", "Ypres",
            "Passchendaele", "Caporetto", "Gallipoli", "Tannenberg", "Jutland",
            "Dogger Bank", "Artois", "Champagne", "Vimy",
        ],
    )
    lieux = take_named(
        ww1,
        [
            "Verdun", "Vimy", "Douaumont", "Vaux", "Craonne",
            "Hartmannswillerkopf", "Vieil-Armand", "Argonne",
            "Notre-Dame-de-Lorette", "Piave", "Dardanelles", "Flandres",
            "Chemin des Dames", "Ypres", "Gallipoli",
        ],
    )
    tombstone("guerre-14", HIST)
    add("bataille-14", HIST, "Nomme une bataille de la Grande Guerre", batailles)
    add("lieu-14", HIST, "Nomme un lieu de la Grande Guerre", lieux)

    for pid, row in extra_by.items():
        if row[2] == "" and row[3] == []:
            continue
        live = next((r for r in bank if r[0] == pid), None)
        if live:
            extra_by[pid] = live

    n_chunks = qa.pack_extra(list(extra_by.values()))
    qa.BANK.write_text(
        json.dumps(bank, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    (qa.ROOT / "public/bank.json").write_text(
        json.dumps(
            {"count": len(bank), "endpoint": "/api/catalog", "source": "bundled+extra"},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "bank": len(bank),
                "chunks": n_chunks,
                "actions": splits,
                "ou_splits": 5,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
