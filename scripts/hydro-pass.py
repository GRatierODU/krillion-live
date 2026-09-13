#!/usr/bin/env python3
"""Narrow or massively expand hydrography prompts (baie / golfe / rade)."""

from __future__ import annotations

import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from importlib.machinery import SourceFileLoader

qa = SourceFileLoader(
    "catalog_qa",
    str(pathlib.Path(__file__).resolve().parent / "apply-catalog-qa.py"),
).load_module()

a = qa.a
GEO = "géographie"


def main() -> None:
    bank = json.loads(qa.BANK.read_text(encoding="utf-8"))
    extra_by = {row[0]: row for row in qa.load_extra()}
    touched: set[str] = set()

    def find(pid: str) -> list:
        return qa.find(bank, pid)

    def upsert(pid: str) -> None:
        touched.add(pid)
        extra_by[pid] = find(pid)

    def replace(pid: str, prompt: str, answers: list) -> None:
        qa.replace(bank, pid, GEO, prompt, answers)
        upsert(pid)

    def new_prompt(pid: str, prompt: str, answers: list) -> None:
        if any(row[0] == pid for row in bank):
            replace(pid, prompt, answers)
            return
        bank.append([pid, GEO, prompt, answers])
        upsert(pid)

    replace(
        "baie-geo",
        "Nomme une baie de France (métropole ou outre-mer)",
        [
            a("Baie de Somme", "p", ["Somme"]),
            a("Baie du Mont-Saint-Michel", "p", ["Mont-Saint-Michel", "Baie du Mont Saint-Michel"]),
            a("Bassin d'Arcachon", "p", ["Arcachon", "Baie d'Arcachon"]),
            a("Baie des Anges", "p", ["Anges"]),
            a("Baie de Cancale", "t", ["Cancale"]),
            a("Baie de Douarnenez", "t", ["Douarnenez"]),
            a("Baie de Quiberon", "t", ["Quiberon"]),
            a("Baie de Saint-Brieuc", "t", ["Saint-Brieuc"]),
            a("Baie de Seine", "t", ["Seine"]),
            a("Baie d'Audierne", "t", ["Audierne"]),
            a("Baie de Morlaix", "b", ["Morlaix"]),
            a("Baie de Lannion", "b", ["Lannion"]),
            a("Baie de Saint-Malo", "t", ["Saint-Malo"]),
            a("Baie de Bourgneuf", "t", ["Bourgneuf"]),
            a("Baie de l'Aiguillon", "t", ["Aiguillon", "Anse de l'Aiguillon"]),
            a("Baie des Veys", "b", ["Veys"]),
            a("Baie d'Authie", "b", ["Authie"]),
            a("Baie de Canche", "b", ["Canche"]),
            a("Baie de Wissant", "r", ["Wissant"]),
            a("Baie des Trépassés", "t", ["Trépassés"]),
            a("Baie de Camaret", "b", ["Camaret"]),
            a("Baie de la Forêt", "b", ["Concarneau", "Baie de Concarneau"]),
            a("Baie de Vilaine", "b", ["Vilaine"]),
            a("Baie du Pouliguen", "t", ["Pouliguen", "Baie de La Baule", "La Baule"]),
            a("Baie des Sables-d'Olonne", "t", ["Sables-d'Olonne"]),
            a("Baie de Txingudi", "b", ["Txingudi", "Chingoudy", "Hendaye"]),
            a("Baie de Cannes", "t", ["Cannes"]),
            a("Baie de Villefranche", "t", ["Villefranche"]),
            a("Baie de Pampelonne", "t", ["Pampelonne"]),
            a("Baie de Cavalaire", "b", ["Cavalaire"]),
            a("Baie de Bandol", "b", ["Bandol"]),
            a("Baie de La Ciotat", "b", ["La Ciotat"]),
            a("Baie de Sanary", "r", ["Sanary"]),
            a("Baie des Sablettes", "r"),
            a("Baie de Calvi", "t", ["Calvi"]),
            a("Baie de Porto", "b"),
            a("Baie de Saint-Florent", "b", ["Saint-Florent"]),
            a("Baie de Propriano", "r", ["Valinco"]),
            a("Baie de Rondinara", "r", ["Rondinara"]),
            a("Baie de Palombaggia", "b", ["Palombaggia"]),
            a("Baie de Santa Giulia", "r", ["Santa Giulia"]),
            a("Baie de Figari", "r"),
            a("Bassin de Marennes-Oléron", "b", ["Marennes", "Marennes-Oléron"]),
            a("Baie de Goulven", "r", ["Goulven"]),
            a("Baie de Dinan", "c", ["Crozon"]),
            a("Baie de Bonne Anse", "c"),
            a("Baie des Saintes", "t", ["Saintes", "Les Saintes"]),
            a("Baie de Fort-de-France", "t", ["Fort-de-France"]),
            a("Baie du Marin", "b", ["Marin"]),
            a("Baie de Deshaies", "b", ["Deshaies"]),
            a("Baie du Robert", "r", ["Robert"]),
            a("Baie de Sainte-Anne", "r"),
            a("Baie de Nouméa", "t", ["Nouméa"]),
            a("Baie de Prony", "r", ["Prony"]),
            a("Baie de Matavai", "b", ["Matavai"]),
            a("Baie de Cook", "b", ["Moorea"]),
            a("Baie d'Opunohu", "r", ["Opunohu"]),
            a("Baie de Taiohae", "r", ["Taiohae"]),
            a("Baie de Mamoudzou", "b", ["Mamoudzou"]),
            a("Baie de Dzoumogné", "c", ["Dzoumogné"]),
            a("Baie de Saint-Pierre", "b", ["Saint-Pierre-et-Miquelon"]),
            a("Baie de Grande Anse", "r", ["Grande Anse"]),
        ],
    )

    new_prompt(
        "baie-monde",
        "Nomme une baie célèbre hors de France",
        [
            a("Baie d'Hudson", "p", ["Hudson", "Hudson Bay"]),
            a("Baie d'Along", "p", ["Along", "Ha Long", "Halong", "Baie d'Ha Long", "Halong Bay"]),
            a("Baie de San Francisco", "p", ["San Francisco"]),
            a("Baie de Fundy", "p", ["Fundy"]),
            a("Baie de Tokyo", "p", ["Tokyo"]),
            a("Baie de Sydney", "p", ["Sydney", "Port Jackson", "Sydney Harbour"]),
            a("Baie de Naples", "t", ["Naples"]),
            a("Baie de Chesapeake", "t", ["Chesapeake", "Chesapeake Bay"]),
            a("Baie de Guanabara", "t", ["Guanabara", "Baie de Rio"]),
            a("Table Bay", "t", ["Baie de la Table", "Le Cap"]),
            a("Botany Bay", "t", ["Botany"]),
            a("Baie de Manille", "t", ["Manille", "Manila Bay"]),
            a("Baie d'Osaka", "b", ["Osaka"]),
            a("Monterey Bay", "t", ["Monterey"]),
            a("Tampa Bay", "t", ["Tampa"]),
            a("Delaware Bay", "b", ["Delaware"]),
            a("Mobile Bay", "b", ["Mobile"]),
            a("Galveston Bay", "b", ["Galveston"]),
            a("San Diego Bay", "b", ["San Diego"]),
            a("Santa Monica Bay", "b", ["Santa Monica"]),
            a("Massachusetts Bay", "b"),
            a("Cape Cod Bay", "b", ["Cape Cod"]),
            a("Penobscot Bay", "r"),
            a("Narragansett Bay", "r"),
            a("Casco Bay", "r"),
            a("Jamaica Bay", "r"),
            a("Ungava", "t", ["Baie d'Ungava", "Ungava Bay"]),
            a("James Bay", "t", ["Baie James"]),
            a("Baie de Baffin", "t", ["Baffin"]),
            a("Disko", "r", ["Baie de Disko"]),
            a("Baie des Chaleurs", "t", ["Chaleurs"]),
            a("Georgian Bay", "b"),
            a("Green Bay", "b"),
            a("Thunder Bay", "b"),
            a("Conception Bay", "r"),
            a("Glacier Bay", "t"),
            a("Bristol Bay", "b"),
            a("False Bay", "b"),
            a("Algoa Bay", "r"),
            a("Saldanha", "r"),
            a("Walvis Bay", "b", ["Walvis"]),
            a("Maputo Bay", "b", ["Delagoa"]),
            a("Baie d'Antsiranana", "b", ["Diego-Suarez", "Diego Suarez"]),
            a("Todos os Santos", "t", ["Baie de Todos os Santos", "Salvador"]),
            a("Bahía Blanca", "b"),
            a("Bahía de Banderas", "b", ["Puerto Vallarta"]),
            a("Acapulco", "t", ["Baie d'Acapulco"]),
            a("Valparaíso", "b"),
            a("Bay of Plenty", "t"),
            a("Hawke's Bay", "b", ["Hawke"]),
            a("Bay of Islands", "t", ["Baie des Îles"]),
            a("Shark Bay", "t", ["Requin"]),
            a("Port Phillip", "t", ["Melbourne"]),
            a("Moreton Bay", "b"),
            a("Geographe Bay", "r"),
            a("Maya Bay", "t", ["Maya"]),
            a("Phang Nga", "b"),
            a("Baie de Nha Trang", "b", ["Nha Trang"]),
            a("Cam Ranh", "r"),
            a("Subic Bay", "r", ["Subic"]),
            a("Jakarta Bay", "r"),
            a("Sagami", "r"),
            a("Ise", "r"),
            a("Peter the Great", "r", ["Pierre le Grand"]),
            a("Galway Bay", "t", ["Galway"]),
            a("Dublin Bay", "t", ["Dublin"]),
            a("Bantry Bay", "t", ["Bantry"]),
            a("Donegal Bay", "b"),
            a("Clew Bay", "r"),
            a("Cardigan Bay", "b", ["Cardigan"]),
            a("Morecambe Bay", "b", ["Morecambe"]),
            a("The Wash", "t", ["Wash"]),
            a("Lyme Bay", "b", ["Lyme"]),
            a("Tor Bay", "r", ["Torbay"]),
            a("Weymouth Bay", "r"),
            a("Mount's Bay", "r"),
            a("Solway", "r"),
            a("Scapa Flow", "t", ["Scapa"]),
            a("Bouches de Kotor", "t", ["Kotor", "Boka Kotorska", "Baie de Kotor"]),
            a("Corne d'Or", "b", ["Golden Horn"]),
            a("Baie des Cochons", "p", ["Cochons", "Bay of Pigs"]),
            a("Baie de Guantánamo", "t", ["Guantanamo", "Guantánamo"]),
            a("Victoria Harbour", "t", ["Hong Kong", "Victoria"]),
            a("Pearl Harbor", "t", ["Pearl", "Pearl Harbour"]),
            a("Baie de New York", "t", ["New York", "Upper New York Bay"]),
            a("Baie d'Alger", "t", ["Alger"]),
            a("Baie de Halifax", "t", ["Halifax"]),
            a("English Bay", "b", ["Vancouver"]),
            a("Baie de Haïfa", "b", ["Haifa", "Haïfa"]),
            a("Baie de Sébastopol", "t", ["Sebastopol", "Sébastopol"]),
            a("Baie de Plymouth", "b", ["Plymouth"]),
            a("Baie de Paraty", "b", ["Paraty"]),
            a("Baie de La Havane", "t", ["Havane", "Havana"]),
            a("Baie de Kingston", "b", ["Kingston"]),
        ],
    )

    replace(
        "golfe",
        "Nomme un golfe",
        [
            a("Golfe Persique", "p", ["Persique", "Golfe Arabique", "Golfe arabo-persique"]),
            a("Golfe du Mexique", "p", ["Mexique"]),
            a("Golfe de Gascogne", "p", ["Gascogne", "Biscaye", "Golfe de Biscaye"]),
            a("Golfe du Lion", "p", ["Lion"]),
            a("Golfe du Bengale", "p", ["Bengale"]),
            a("Golfe de Guinée", "t", ["Guinée"]),
            a("Golfe de Thaïlande", "t", ["Thaïlande", "Siam", "Golfe du Siam"]),
            a("Golfe d'Aden", "t", ["Aden"]),
            a("Golfe d'Oman", "t", ["Oman"]),
            a("Golfe de Finlande", "t", ["Finlande"]),
            a("Golfe de Botnie", "t", ["Botnie"]),
            a("Golfe du Saint-Laurent", "t", ["Saint-Laurent"]),
            a("Golfe de Californie", "t", ["Californie", "Mer de Cortés", "Mer de Cortez"]),
            a("Golfe de Carpentarie", "b", ["Carpentarie"]),
            a("Golfe de Corinthe", "t", ["Corinthe"]),
            a("Golfe de Tarente", "b", ["Tarente"]),
            a("Golfe de Venise", "t", ["Venise"]),
            a("Golfe de Trieste", "b", ["Trieste"]),
            a("Golfe de Gênes", "t", ["Gênes"]),
            a("Golfe de Naples", "t", ["Naples"]),
            a("Golfe d'Aqaba", "t", ["Aqaba", "Eilat", "Golfe d'Eilat"]),
            a("Golfe de Suez", "t", ["Suez"]),
            a("Golfe de Porto", "b", ["Porto"]),
            a("Golfe du Morbihan", "p", ["Morbihan"]),
            a("Golfe Juan", "t", ["Golfe-Juan"]),
            a("Golfe d'Ajaccio", "t", ["Ajaccio"]),
            a("Golfe de Porto-Vecchio", "b", ["Porto-Vecchio"]),
            a("Golfe de Saint-Tropez", "t", ["Saint-Tropez"]),
            a("Golfe de Fos", "b", ["Fos"]),
            a("Golfe d'Alaska", "t", ["Alaska"]),
            a("Golfe du Tonkin", "t", ["Tonkin", "Bac Bo"]),
            a("Golfe de Bohai", "b", ["Bohai"]),
            a("Golfe du Honduras", "b", ["Honduras"]),
            a("Golfe de Sidra", "b", ["Sidra", "Syrte", "Grande Syrte"]),
            a("Golfe de Gabès", "t", ["Gabès"]),
            a("Golfe d'Hammamet", "b", ["Hammamet"]),
            a("Golfe de Tunis", "b", ["Tunis"]),
            a("Golfe de Riga", "b", ["Riga"]),
            a("Golfe de Dantzig", "b", ["Dantzig", "Gdańsk", "Gdansk"]),
            a("Golfe de Papouasie", "b", ["Papouasie"]),
            a("Golfe de Martaban", "r", ["Martaban"]),
            a("Golfe d'Amundsen", "r", ["Amundsen"]),
            a("Golfe de Guayaquil", "b", ["Guayaquil"]),
            a("Golfe du Venezuela", "b", ["Venezuela"]),
            a("Golfe d'Ob", "r", ["Ob"]),
            a("Golfe de Mannar", "r", ["Mannar"]),
            a("Golfe d'Argolide", "r", ["Argolide"]),
            a("Golfe Saronique", "b", ["Saronique", "Égine"]),
            a("Golfe Thermaïque", "b", ["Thermaïque", "Salonique", "Thessalonique"]),
            a("Golfe de Panama", "t", ["Panama"]),
            a("Golfe de Fonseca", "b", ["Fonseca"]),
            a("Golfe de Darién", "r", ["Darién"]),
            a("Golfe de Tehuantepec", "b", ["Tehuantepec"]),
            a("Golfe de Campeche", "t", ["Campeche"]),
            a("Golfe du Maine", "t", ["Maine"]),
            a("Golfe de Cadix", "t", ["Cadix", "Cádiz"]),
            a("Golfe de Valence", "b", ["Valence"]),
            a("Golfe de Salerne", "b", ["Salerne"]),
            a("Golfe de Gaète", "r", ["Gaète"]),
            a("Golfe de Cagliari", "b", ["Cagliari"]),
            a("Golfe d'Oristano", "r"),
            a("Golfe de Catane", "b", ["Catane"]),
            a("Golfe de Manfredonia", "r"),
            a("Golfe de Kotor", "t", ["Kotor"]),
            a("Golfe de Laconie", "r", ["Laconie"]),
            a("Golfe de Messénie", "r"),
            a("Golfe Pagasétique", "r"),
            a("Golfe d'Izmir", "b", ["Smyrne", "Izmir"]),
            a("Golfe d'Antalya", "b", ["Antalya"]),
            a("Golfe d'Alexandrette", "b", ["İskenderun", "Alexandrette"]),
            a("Golfe de Khambhat", "r", ["Cambaye"]),
            a("Golfe de Kutch", "r", ["Kutch"]),
            a("Golfe Saint-Vincent", "b"),
            a("Spencer Gulf", "b", ["Golfe Spencer"]),
            a("Golfe de Joseph Bonaparte", "r"),
            a("Van Diemen Gulf", "c"),
            a("Golfe d'Anadyr", "c"),
            a("Cook Inlet", "b"),
            a("Golfe de Boothia", "c"),
            a("Golfe du Paria", "r", ["Paria"]),
            a("San Matías", "r"),
            a("Golfe de Penas", "c"),
            a("Golfe d'Oran", "b", ["Oran"]),
            a("Golfe de Béjaïa", "b", ["Bougie", "Béjaïa"]),
            a("Golfe d'Arzew", "r"),
            a("Golfe d'Annaba", "r"),
            a("Golfe de Valinco", "r"),
            a("Golfe de Sagone", "r"),
            a("Golfe de Propriano", "r"),
            a("Golfe de Lava", "c"),
            a("Golfe de Tomini", "c"),
            a("Golfe de Boni", "c"),
            a("Golfe de Liaodong", "r"),
            a("Grande Baie australienne", "t", ["Great Australian Bight", "Baie australienne"]),
            a("Golfe de Bénin", "b", ["Bénin", "Benin"]),
            a("Golfe de Biafra", "b", ["Biafra", "Bonny"]),
            a("Golfe de Lépante", "t", ["Lépante", "Naupacte"]),
            a("Golfe de Roses", "b", ["Roses"]),
            a("Golfe de Squillace", "r", ["Squillace"]),
        ],
    )

    replace(
        "rade",
        "Nomme une rade française",
        [
            a("Rade de Brest", "p", ["Brest"]),
            a("Rade de Toulon", "p", ["Toulon", "Petite rade", "Grande rade"]),
            a("Rade de Cherbourg", "t", ["Cherbourg"]),
            a("Rade de Lorient", "t", ["Lorient"]),
            a("Rade de Villefranche-sur-Mer", "t", ["Villefranche", "Rade de Villefranche"]),
            a("Rade d'Hyères", "t", ["Hyères"]),
            a("Rade de Marseille", "t", ["Marseille"]),
            a("Rade de Bordeaux", "b", ["Bordeaux"]),
            a("Rade de Boulogne-sur-Mer", "b", ["Boulogne"]),
            a("Rade d'Agay", "b", ["Agay"]),
            a("Rade de Bormes", "r", ["Bormes"]),
            a("Rade de Cavalaire", "r", ["Cavalaire"]),
            a("Rade de Concarneau", "b", ["Concarneau"]),
            a("Rade de Morlaix", "b", ["Morlaix"]),
            a("Rade de Saint-Tropez", "t", ["Saint-Tropez"]),
            a("Rade de Sète", "b", ["Sète"]),
            a("Rade de La Pallice", "b", ["La Pallice", "La Rochelle"]),
            a("Rade de Saint-Vaast", "r", ["Saint-Vaast", "La Hougue"]),
            a("Rade de Port-Louis", "r", ["Port-Louis"]),
            a("Rade de Golfe-Juan", "b", ["Golfe-Juan"]),
            a("Rade d'Antibes", "b", ["Antibes"]),
            a("Rade du Lavandou", "r", ["Lavandou"]),
            a("Rade de Giens", "r", ["Giens"]),
            a("Rade de Fréjus", "r", ["Fréjus"]),
            a("Rade de Beaulieu", "r", ["Beaulieu"]),
            a("Rade d'Aix", "r", ["Île d'Aix"]),
            a("Rade de Fort-de-France", "t", ["Fort-de-France"]),
            a("Rade de Pointe-à-Pitre", "b", ["Pointe-à-Pitre"]),
            a("Rade de Saint-Pierre", "b", ["Saint-Pierre"]),
            a("Rade de Nouméa", "t", ["Nouméa"]),
            a("Rade de Papeete", "t", ["Papeete"]),
            a("Rade de Chiconi", "r", ["Chiconi"]),
            a("Rade des Saintes", "b", ["Saintes"]),
            a("Rade de Dzaoudzi", "r", ["Dzaoudzi"]),
        ],
    )

    # Famous strait aliases people type on a similar hydrography card
    row = find("detroit")
    have = {ans[0].casefold() for ans in row[3]}
    extras = [
        a("Pas de Calais", "p", ["Douvres", "Dover", "Détroit du Pas de Calais"]),
        a("Øresund", "t", ["Oresund", "Sund"]),
        a("Détroit de Dardanelles", "t", ["Hellespont"]),
        a("Détroit de Bonifacio", "t"),
        a("Détroit de Messine", "t"),
        a("Détroit d'Otrante", "b"),
        a("Passage du Nord-Ouest", "t"),
        a("Passage du Nord-Est", "b"),
    ]
    for ans in extras:
        if ans[0].casefold() not in have:
            row[3].append(ans)
            have.add(ans[0].casefold())
    row[2] = "Nomme un détroit célèbre"
    upsert("detroit")

    for pid in touched:
        extra_by[pid] = next(r for r in bank if r[0] == pid)

    n_chunks = qa.pack_extra(list(extra_by.values()))
    qa.BANK.write_text(json.dumps(bank, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (qa.ROOT / "public/bank.json").write_text(
        json.dumps(
            {"count": len(bank), "endpoint": "/api/catalog", "source": "bundled+extra"},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    summary = {
        "bank": len(bank),
        "chunks": n_chunks,
        "baie-geo": {"n": len(find("baie-geo")[3]), "q": find("baie-geo")[2]},
        "baie-monde": {"n": len(find("baie-monde")[3]), "q": find("baie-monde")[2]},
        "golfe": {"n": len(find("golfe")[3]), "q": find("golfe")[2]},
        "rade": {"n": len(find("rade")[3]), "q": find("rade")[2]},
        "detroit": {"n": len(find("detroit")[3]), "q": find("detroit")[2]},
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
