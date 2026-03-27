#!/usr/bin/env python3
import json
import urllib.request
import time

BASE_URL = "https://5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"
DOMAIN = "5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"

def get_page_id():
    with urllib.request.urlopen("http://localhost:9222/json") as resp:
        pages = json.loads(resp.read())
    for page in pages:
        if page.get('type') == 'page':
            return page['id']
    return None

def main():
    page_id = get_page_id()
    if not page_id:
        print("Could not find browser page")
        return

    # Comme on ne peut pas utiliser de websocket facilement sans --remote-allow-origins,
    # on va utiliser browser_navigate et browser_console_exec de Manus qui sont déjà configurés
    # Mais Manus a des problèmes de connexion fermée.
    # On va tenter d'utiliser Manus pour injecter les cookies via une navigation.
    print(f"Page ID: {page_id}")

if __name__ == "__main__":
    main()
