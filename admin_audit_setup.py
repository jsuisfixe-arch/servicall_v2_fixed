#!/usr/bin/env python3
import json
import time
import urllib.request
import websocket

BASE_URL = "https://5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"
DOMAIN = "5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"

def get_page_id():
    with urllib.request.urlopen("http://localhost:9222/json") as resp:
        pages = json.loads(resp.read())
    for page in pages:
        if page.get('type') == 'page':
            return page['id'], page['webSocketDebuggerUrl']
    return None, None

def cdp_command(ws_url, method, params=None):
    # Ajouter l'origine pour éviter le 403 Forbidden
    ws = websocket.create_connection(ws_url, origin="http://localhost:9222")
    cmd = {"id": 1, "method": method, "params": params or {}}
    ws.send(json.dumps(cmd))
    result = json.loads(ws.recv())
    ws.close()
    return result

def main():
    page_id, ws_url = get_page_id()
    if not ws_url:
        print("Could not find browser page")
        return

    print(f"Connecting to {ws_url}")
    
    # 1. Naviguer vers la page pour établir le contexte du domaine
    cdp_command(ws_url, "Page.navigate", {"url": f"{BASE_URL}/login"})
    time.sleep(3)
    
    # 2. Injecter les cookies admin
    session_cookie = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbi10MHBpUk9uY05oIiwibmFtZSI6IlN5c3RlbSBBZG1pbiIsImV4cCI6MTc3NDI3OTUyNiwiaWF0IjoxNzc0MTkzMTI2LCJqdGkiOiI1NTUwMTRiNy1lNThjLTQwYjgtOTQ3MS02NjA5YWFjZTkyN2IifQ.PfZpNdSm8FoSSquLvXAEgdJc8rE0rvofdEpcuRZiOo4"
    tenant_cookie = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6MSwidXNlcklkIjoxLCJyb2xlIjoiYWRtaW4iLCJpc3N1ZWRBdCI6MTc3NDE5MzEyNjY1NCwiZXhwIjoxNzc2Nzg1MTI2LCJpYXQiOjE3NzQxOTMxMjZ9.RjGrJH-pWA03rTK6J5y3w9o55rano37Lavsn5tvfIVI"
    
    cdp_command(ws_url, "Network.setCookie", {
        "name": "servicall_session",
        "value": session_cookie,
        "domain": DOMAIN,
        "path": "/",
        "httpOnly": True,
        "sameSite": "Lax"
    })
    
    cdp_command(ws_url, "Network.setCookie", {
        "name": "servicall_tenant", 
        "value": tenant_cookie,
        "domain": DOMAIN,
        "path": "/",
        "httpOnly": True,
        "sameSite": "None",
        "secure": True
    })
    
    # 3. Naviguer vers Coaching
    cdp_command(ws_url, "Page.navigate", {"url": f"{BASE_URL}/coaching"})
    print("Navigation vers Coaching initiée avec succès")
    time.sleep(3)

if __name__ == "__main__":
    main()
