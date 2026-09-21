# Store Front Standard

Private prototype for a reusable **3D storefront web standard**.

The first reference implementation uses the McDonald's location at 8937 Rancho Del Rio Drive in New Port Richey, Florida as a visual/product-flow reference. This is an **unofficial concept demo** and is not affiliated with, endorsed by, or connected to McDonald's Corporation.

## Prototype loop

3D storefront → enter restaurant → interior navigation → clickable kiosk → demo menu/cart → pickup choice → concept checkout.

## Controls

- Phone/tablet: on-screen directional pad
- Desktop: WASD or arrow keys
- Tap/click the entrance and yellow kiosk screens

## Files

- `index.html` — interface and kiosk
- `style.css` — responsive presentation
- `app.js` — Three.js scene, movement and order flow

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Current branch strategy

- `main` — protected clean baseline
- `dev` — active prototype development

The long-term product is brand-agnostic: restaurants keep their existing menu/order/payment stack underneath while the customer-facing web experience becomes spatial, interactive and kiosk-like.