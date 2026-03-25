#!/usr/bin/env python3
"""Script pour se connecter à Servicall via CDP et naviguer vers la page d'extraction"""
import json
import time
import urllib.request
import websocket

BASE_URL = "https://5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"

def get_page_id():
    """Obtenir l'ID de la page active dans Chrome"""
    with urllib.request.urlopen("http://localhost:9222/json") as resp:
        pages = json.loads(resp.read())
    # Prendre la première page de type 'page'
    for page in pages:
        if page.get('type') == 'page':
            return page['id'], page['webSocketDebuggerUrl']
    return None, None

def cdp_command(ws_url, method, params=None):
    """Envoyer une commande CDP"""
    ws = websocket.create_connection(ws_url)
    cmd = {"id": 1, "method": method, "params": params or {}}
    ws.send(json.dumps(cmd))
    result = json.loads(ws.recv())
    ws.close()
    return result

def main():
    page_id, ws_url = get_page_id()
    print(f"Page ID: {page_id}")
    print(f"WS URL: {ws_url}")
    
    # Naviguer vers la page de connexion
    result = cdp_command(ws_url, "Page.navigate", {"url": f"{BASE_URL}/login"})
    print(f"Navigate result: {result}")
    time.sleep(3)
    
    # Injecter les cookies de session
    session_cookie = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbi10MHBpUk9uY05oIiwibmFtZSI6IlN5c3RlbSBBZG1pbiIsImV4cCI6MTc3NDI3OTI2MywiaWF0IjoxNzc0MTkyODYzLCJqdGkiOiIzNTkwODk0OC0zNzg0LTQ5YmYtOGY4ZS02NTFlNjc0NDNiNDAifQ.RGRm9wnbMCOrh3AdESBhP77KHZGcsLur4dVKa_Bhz08"
    tenant_cookie = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6MSwidXNlcklkIjoxLCJyb2xlIjoiYWRtaW4iLCJpc3N1ZWRBdCI6MTc3NDE5Mjg2MzExNiwiZXhwIjoxNzc2Nzg0ODYzLCJpYXQiOjE3NzQxOTI4NjN9.iFpF2ti7o9KPJAsHNH1G4nAfeDxAt0uhZ86aBJQcYB8"
    
    domain = "5000-ifr5r1164x346hv7sbapl-a00b8fd2.us1.manus.computer"
    
    # Set cookies via Network.setCookie
    result1 = cdp_command(ws_url, "Network.setCookie", {
        "name": "servicall_session",
        "value": session_cookie,
        "domain": domain,
        "path": "/",
        "httpOnly": True,
        "sameSite": "Lax"
    })
    print(f"Set session cookie: {result1}")
    
    result2 = cdp_command(ws_url, "Network.setCookie", {
        "name": "servicall_tenant", 
        "value": tenant_cookie,
        "domain": domain,
        "path": "/",
        "httpOnly": True,
        "sameSite": "None",
        "secure": True
    })
    print(f"Set tenant cookie: {result2}")
    
    # Naviguer vers le dashboard
    result = cdp_command(ws_url, "Page.navigate", {"url": f"{BASE_URL}/dashboard"})
    print(f"Navigate to dashboard: {result}")
    time.sleep(3)
    
    print("Done! Browser should now be on dashboard")

if __name__ == "__main__":
    main()
